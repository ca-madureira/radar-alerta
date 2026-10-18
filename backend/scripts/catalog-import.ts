import "dotenv/config";
import { readFileSync } from "node:fs";
import { db } from "../src/database/index.js";
const path = process.argv[2];
if (!path)
  throw new Error("Uso: npx tsx scripts/catalog-import.ts fontes.json");
const sources = JSON.parse(readFileSync(path, "utf8")) as {
  name: string;
  category: string;
  url: string;
}[];
for (const s of sources) {
  const u = new URL(s.url);
  if (!["http:", "https:"].includes(u.protocol))
    throw new Error("URL inválida");
  await db.catalogSource.upsert({
    where: { url: s.url },
    create: s,
    update: { name: s.name, category: s.category },
  });
}
console.log("Fontes importadas:", sources.length);
await db.$disconnect();
