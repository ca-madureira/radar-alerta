import { db } from "../src/database/index.js";
const plans = [
  {
    id: "free",
    name: "Gratuito",
    intervalMinutes: 720,
    maxMonitors: 3,
    maxSourcesPerMonitor: 1,
  },
  {
    id: "basic",
    name: "Básico",
    intervalMinutes: 360,
    maxMonitors: 10,
    maxSourcesPerMonitor: 3,
  },
  {
    id: "pro",
    name: "Pro",
    intervalMinutes: 60,
    maxMonitors: 30,
    maxSourcesPerMonitor: 5,
  },
  {
    id: "premium",
    name: "Premium",
    intervalMinutes: 15,
    maxMonitors: 100,
    maxSourcesPerMonitor: 10,
  },
];
for (const plan of plans)
  await db.plan.upsert({ where: { id: plan.id }, create: plan, update: plan });
console.log("Planos cadastrados");
await db.$disconnect();
