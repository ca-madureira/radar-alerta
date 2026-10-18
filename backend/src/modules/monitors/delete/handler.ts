import { authenticatedHandler } from "../../../middleware/http.js";
import { response, bad } from "../../../utils/http.js";
import { db } from "../../../database/index.js";
import { uuid } from "../../../schemas/monitors/index.js";
export const handler = authenticatedHandler(async (e, userId) => {
  const id = uuid.parse(e.pathParameters?.id);
  const existing = await db.monitor.findFirst({
    where: { id, userId },
    include: { discovery: true },
  });
  if (!existing) throw bad("Monitoramento não encontrado", 404);
  await db.$transaction([
    db.discoveredResult.deleteMany({ where: { monitorId: id } }),
    db.monitor.delete({ where: { id } }),
  ]);
  return response(200, { deleted: true });
});
