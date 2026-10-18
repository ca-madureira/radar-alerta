import { db } from "../database/index.js";
export async function userPlan(userId: string) {
  const record = await db.userPlan.findUnique({
    where: { userId },
    include: { plan: true },
  });
  if (record) return record.plan;
  const free = await db.plan.findUnique({ where: { id: "free" } });
  if (!free) throw new Error("Execute o seed dos planos");
  return free;
}
