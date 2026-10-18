import { authenticatedHandler } from "../../../middleware/http.js";
import { response, bad } from "../../../utils/http.js";
import { db } from "../../../database/index.js";
import { feedbackSchema } from "../../../schemas/feedback/index.js";
import { parseBody as parse } from "../../../utils/http.js";
export const handler = authenticatedHandler(async (e, userId) => {
  const data = feedbackSchema.parse(parse(e));
  const n = await db.notification.findFirst({
    where: { id: data.notificationId, userId },
  });
  if (!n) throw bad("Notificação não encontrada", 404);
  return response(
    201,
    await db.feedback.upsert({
      where: {
        userId_notificationId: {
          userId,
          notificationId: data.notificationId,
        },
      },
      create: { userId, ...data },
      update: { useful: data.useful, savedMoney: data.savedMoney },
    }),
  );
});
