import { authenticatedHandler } from "../../../middleware/http.js";
import { response, bad } from "../../../utils/http.js";
import { db } from "../../../database/index.js";
import { assignPlanSchema } from "../../../schemas/plans/index.js";
import { parseBody as parse } from "../../../utils/http.js";
export const handler = authenticatedHandler(async (e, userId) => {
  if (!(process.env.ADMIN_USER_IDS || "").split(",").includes(userId))
    throw bad("Acesso negado", 403);
  const data = assignPlanSchema.parse(parse(e));
  const plan = await db.plan.findUnique({ where: { id: data.planId } });
  if (!plan) throw bad("Plano inexistente");
  return response(
    200,
    await db.userPlan.upsert({
      where: { userId: data.userId },
      create: { userId: data.userId, planId: data.planId },
      update: { planId: data.planId },
    }),
  );
});
