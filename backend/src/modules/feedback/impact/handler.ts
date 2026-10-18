import { authenticatedHandler } from "../../../middleware/http.js";
import { response } from "../../../utils/http.js";
import { db } from "../../../database/index.js";
export const handler = authenticatedHandler(async (e, userId) => {
  const feedback = await db.feedback.findMany({
    where: { userId, useful: true },
  });
  return response(200, {
    helpfulAlerts: feedback.length,
    reportedSavings: feedback.reduce((s, x) => s + (x.savedMoney || 0), 0),
  });
});
