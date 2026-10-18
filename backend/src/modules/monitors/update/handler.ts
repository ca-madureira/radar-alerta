import { authenticatedHandler } from "../../../middleware/http.js";
import { response, bad } from "../../../utils/http.js";
import { db } from "../../../database/index.js";
import { userPlan } from "../../../services/plans.js";
import { uuid, updateMonitorSchema } from "../../../schemas/monitors/index.js";
import { queryFor } from "../../../services/search.js";
import { defaultTemporal } from "../../../services/temporal.js";
import { parseBody as parse } from "../../../utils/http.js";
export const handler = authenticatedHandler(async (e, userId) => {
  const id = uuid.parse(e.pathParameters?.id);
  const existing = await db.monitor.findFirst({
    where: { id, userId },
    include: { discovery: true },
  });
  if (!existing) throw bad("Monitoramento não encontrado", 404);
  const data = updateMonitorSchema.parse(parse(e));
  if (data.status === "ACTIVE" && existing.status !== "ACTIVE") {
    const plan = await userPlan(userId);
    if (
      (await db.monitor.count({ where: { userId, status: "ACTIVE" } })) >=
      plan.maxMonitors
    )
      throw bad("Limite do plano atingido", 403);
  }
  const { temporal, ...rest } = data;
  return response(
    200,
    await db.monitor.update({
      where: { id },
      data: {
        ...rest,
        ...(existing.discovery &&
        (data.keywords || data.excludeKeywords || data.matchMode)
          ? {
              discovery: {
                update: {
                  query: queryFor(
                    data.keywords ?? existing.keywords,
                    data.matchMode ?? existing.matchMode,
                    data.excludeKeywords ?? existing.excludeKeywords,
                  ),
                },
              },
            }
          : {}),
        ...(temporal
          ? {
              temporal: {
                upsert: {
                  create: {
                    ...defaultTemporal,
                    ...temporal,
                    since: temporal.since ? new Date(temporal.since) : null,
                  },
                  update: {
                    ...temporal,
                    ...("since" in temporal
                      ? {
                          since: temporal.since
                            ? new Date(temporal.since)
                            : null,
                        }
                      : {}),
                  },
                },
              },
            }
          : {}),
        ...(data.status === "ACTIVE" ? { nextCheckAt: new Date() } : {}),
      },
      include: { temporal: true },
    }),
  );
});
