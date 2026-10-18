import { authenticatedHandler } from "../../../middleware/http.js";
import { response } from "../../../utils/http.js";
import { db } from "../../../database/index.js";
export const handler = authenticatedHandler(async (e, userId) => {
  return response(
    200,
    await db.notification.findMany({
      where: { userId },
      include: {
        detection: {
          select: {
            title: true,
            snippet: true,
            url: true,
            createdAt: true,
            publishedAt: true,
            sourceUpdatedAt: true,
            dateConfidence: true,
            eventType: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  );
});
