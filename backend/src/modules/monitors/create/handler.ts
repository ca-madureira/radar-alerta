import { authenticatedHandler } from "../../../middleware/http.js";
import { response, bad } from "../../../utils/http.js";
import { db } from "../../../database/index.js";
import { userPlan } from "../../../services/plans.js";
import { safeUrl } from "../../../services/scrape.js";
import { queryFor } from "../../../services/search.js";
import { searchConfigured } from "../../../services/search-config.js";
import { monitorSchema } from "../../../schemas/monitors/index.js";
import { parseBody as parse } from "../../../utils/http.js";
export const handler = authenticatedHandler(async (e, userId) => {
  const parsed = monitorSchema.safeParse(parse(e));
  if (!parsed.success) throw bad(parsed.error.message);
  const data = parsed.data;
  if (data.searchWeb && !searchConfigured())
    throw bad(
      "Busca web indisponível. Monitore uma URL ou fonte do catálogo.",
      409,
    );
  if (data.searchWeb && (data.urls.length || data.catalogIds.length))
    throw bad("Crie monitoramentos separados para busca web e URLs fixas.");
  const catalog = await db.catalogSource.findMany({
    where: { id: { in: data.catalogIds }, active: true },
  });
  if (catalog.length !== new Set(data.catalogIds).size)
    throw bad("Fonte do catálogo inválida");
  const urls = [...new Set([...data.urls, ...catalog.map((x) => x.url)])];
  if (!urls.length && !data.searchWeb)
    throw bad("Informe uma URL, fonte ou busca web");
  const plan = await userPlan(userId);
  const count = await db.monitor.count({
    where: { userId, status: "ACTIVE" },
  });
  if (count >= plan.maxMonitors) throw bad("Limite do plano atingido", 403);
  if (urls.length > plan.maxSourcesPerMonitor)
    throw bad("Limite de fontes do plano atingido", 403);
  for (const url of urls) await safeUrl(url);
  const created = await db.monitor.create({
    data: {
      userId,
      name: data.name,
      keywords: data.keywords,
      excludeKeywords: data.excludeKeywords,
      matchMode: data.matchMode,
      sources: { create: urls.map((url) => ({ url })) },
      temporal: {
        create: {
          ...data.temporal,
          since: data.temporal.since ? new Date(data.temporal.since) : null,
        },
      },
      ...(data.searchWeb
        ? {
            discovery: {
              create: {
                query: queryFor(
                  data.keywords,
                  data.matchMode,
                  data.excludeKeywords,
                ),
              },
            },
          }
        : {}),
    },
    include: { sources: true, temporal: true },
  });
  return response(201, created);
});
