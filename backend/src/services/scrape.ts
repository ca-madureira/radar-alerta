import { load } from "cheerio";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { createHash } from "node:crypto";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { normalize } from "./matching.js";
import { extractPageDates } from "./temporal.js";
function privateIp(ip: string) {
  if (ip.includes(":")) return true;
  const a = ip.split(".").map(Number);
  return (
    a[0] === 10 ||
    (a[0] === 100 && a[1] >= 64 && a[1] <= 127) ||
    (a[0] === 192 && a[1] === 0 && a[2] === 0) ||
    (a[0] === 198 && [18, 19].includes(a[1])) ||
    (a[0] === 192 && a[1] === 0 && a[2] === 2) ||
    (a[0] === 198 && a[1] === 51 && a[2] === 100) ||
    (a[0] === 203 && a[1] === 0 && a[2] === 113) ||
    a[0] === 127 ||
    a[0] === 0 ||
    (a[0] === 169 && a[1] === 254) ||
    (a[0] === 172 && a[1] >= 16 && a[1] <= 31) ||
    (a[0] === 192 && a[1] === 168) ||
    a[0] >= 224
  );
}
async function publicDestination(input: string) {
  let u: URL;
  try {
    u = new URL(input);
  } catch {
    throw new Error("URL inválida");
  }
  if (
    !["https:", "http:"].includes(u.protocol) ||
    u.username ||
    u.password ||
    (u.port && !["80", "443"].includes(u.port))
  )
    throw new Error("URL não permitida");
  if (isIP(u.hostname)) throw new Error("Endereço IP não permitido");
  // Use and pin public IPv4 records. Ignore IPv6 records rather than rejecting
  // otherwise valid dual-stack institutional sites.
  const addresses = (await lookup(u.hostname, { all: true })).filter(
    (address) => address.family === 4,
  );
  if (!addresses.length || addresses.some((x) => privateIp(x.address)))
    throw new Error("Destino privado não permitido");
  return { url: u, address: addresses[0] };
}
export async function safeUrl(input: string) {
  return (await publicDestination(input)).url;
}

async function fetchHtml(input: string) {
  const { url, address } = await publicDestination(input);
  return new Promise<{ status: number; location?: string; html: string }>(
    (resolve, reject) => {
      const request = url.protocol === "https:" ? httpsRequest : httpRequest;
      const req = request(
        url,
        {
          method: "GET",
          agent: false,
          // TLS still verifies the original hostname; DNS is pinned for this request.
          lookup: (_hostname, options, callback) => {
            if (options.all) callback(null, [address]);
            else callback(null, address.address, address.family);
          },
          headers: {
            "user-agent": "RadarAlertas/1.0 (public page monitoring)",
            accept: "text/html,application/xhtml+xml",
            "accept-encoding": "identity",
          },
          signal: AbortSignal.timeout(12000),
        },
        (res) => {
          const status = res.statusCode ?? 0;
          if ([301, 302, 303, 307, 308].includes(status)) {
            res.destroy();
            resolve({ status, location: res.headers.location, html: "" });
            return;
          }
          const type = res.headers["content-type"] ?? "";
          if (
            status < 200 ||
            status >= 300 ||
            (!type.includes("text/html") &&
              !type.includes("application/xhtml+xml"))
          ) {
            res.destroy();
            reject(new Error("Falha HTTP ou conteúdo não HTML"));
            return;
          }
          if (Number(res.headers["content-length"] || 0) > 2_000_000) {
            res.destroy();
            reject(new Error("Página muito grande"));
            return;
          }
          const chunks: Buffer[] = [];
          let size = 0;
          res.on("data", (chunk: Buffer) => {
            size += chunk.length;
            if (size > 2_000_000) {
              res.destroy(new Error("Página muito grande"));
              return;
            }
            chunks.push(chunk);
          });
          res.on("end", () =>
            resolve({ status, html: Buffer.concat(chunks).toString("utf8") }),
          );
          res.on("error", reject);
          res.on("aborted", () => reject(new Error("Coleta interrompida")));
        },
      );
      req.on("error", reject);
      req.end();
    },
  );
}
export async function scrape(input: string) {
  let url = input;
  for (let i = 0; i < 3; i++) {
    const res = await fetchHtml(url);
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const loc = res.location;
      if (!loc) throw new Error("Redirecionamento inválido");
      url = new URL(loc, url).toString();
      continue;
    }
    return parsePage(res.html, url);
  }
  throw new Error("Redirecionamento excessivo");
}

export function parsePage(html: string, url: string) {
  const $ = load(html);
  $("script,style,noscript,svg,footer,nav").remove();
  const title =
    $("title").first().text().trim().slice(0, 180) || "Atualização detectada";
  if (/captcha|access denied|attention required|just a moment/i.test(title))
    throw new Error(
      "Fonte bloqueou a coleta com CAPTCHA ou controle de acesso",
    );
  // Keep block boundaries so edits to navigation/unrelated content do not
  // masquerade as a new matching course announcement.
  $("p,li,h1,h2,h3,h4,h5,h6,tr,article,section,div,br").each((_, el) => {
    $(el).append("\n");
  });
  const text = $("main").text() || $("article").text() || $("body").text();
  const cleaned = text
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .slice(0, 150000);
  return {
    title,
    text: cleaned,
    url,
    dates: extractPageDates(html),
    hash: createHash("sha256").update(normalize(cleaned)).digest("hex"),
  };
}
