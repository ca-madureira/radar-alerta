import "dotenv/config";
import { readFileSync } from "node:fs";
import { db } from "../src/database/index.js";
import { runWorker } from "../src/services/worker.js";
import { userPlan } from "../src/services/plans.js";

const email = process.argv[2];
if (!email)
  throw new Error("Uso: npm run examples:postgraduate -- email-da-sua-conta");
const sources = JSON.parse(
  readFileSync(new URL("./postgraduate-sources.json", import.meta.url), "utf8"),
) as { name: string; category: string; url: string }[];
const keywordSets = [
  ["full stack", "fullstack"],
  ["desenvolvimento web", "desenvolvimento de sistemas", "full stack"],
  ["tecnologias de sistemas", "inscrições"],
];
try {
  const users = await db.$queryRaw<
    { id: string }[]
  >`SELECT id FROM auth.users WHERE lower(email) = lower(${email})`;
  if (users.length !== 1)
    throw new Error("Cadastre primeiro essa conta no aplicativo.");
  const userId = users[0].id;
  const plan = await userPlan(userId);
  const ids: string[] = [];
  for (const [index, source] of sources.entries()) {
    await db.catalogSource.upsert({
      where: { url: source.url },
      create: source,
      update: source,
    });
    let monitor = await db.monitor.findFirst({
      where: {
        userId,
        OR: [{ name: source.name }, { sources: { some: { url: source.url } } }],
      },
    });
    if (monitor && monitor.name !== source.name)
      monitor = await db.monitor.update({
        where: { id: monitor.id },
        data: { name: source.name },
      });
    if (!monitor) {
      if (
        (await db.monitor.count({ where: { userId, status: "ACTIVE" } })) >=
        plan.maxMonitors
      )
        throw new Error(
          "Limite de monitoramentos do plano atingido; os existentes foram preservados.",
        );
      monitor = await db.monitor.create({
        data: {
          userId,
          name: source.name,
          keywords: keywordSets[index],
          sources: { create: { url: source.url } },
          temporal: {
            create: {
              dateBasis: "DISCOVERED",
              lookbackDays: 0,
              onlyNew: true,
              notifyUpdates: true,
              requireVerifiedDate: true,
            },
          },
        },
      });
    }
    ids.push(monitor.id);
  }
  const result = await runWorker({ monitorIds: ids, deliver: async () => {} });
  console.log("Coleta real nas fontes oficiais:", JSON.stringify(result));
  const monitors = await db.monitor.findMany({
    where: { id: { in: ids } },
    include: { sources: true },
  });
  for (const monitor of monitors) {
    console.log(
      JSON.stringify({
        name: monitor.name,
        nextCheckAt: monitor.nextCheckAt,
        sources: monitor.sources.map((s) => ({
          url: s.url,
          baseline: Boolean(s.lastHash),
          checkedAt: s.checkedAt,
          error: s.lastError,
        })),
      }),
    );
  }
  console.log(
    `Intervalo do plano: ${plan.intervalMinutes} minutos. A primeira coleta não gera alerta antigo.`,
  );
} finally {
  await db.$disconnect();
}
