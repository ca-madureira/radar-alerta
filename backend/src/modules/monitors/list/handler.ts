import { authenticatedHandler } from "../../../middleware/http.js";
import { response } from "../../../utils/http.js";
import { db } from "../../../database/index.js";
export const handler = authenticatedHandler(async (e, userId) => {
  return response(
    200,
    await db.monitor.findMany({
      where: { userId },
      include: {
        temporal: true,
        sources: {
          select: { id: true, url: true, checkedAt: true, lastError: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  );
});
