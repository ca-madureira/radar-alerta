import { db } from "../database/index.js";
export function acceptedPushTickets(payload: unknown, expected: number) {
  if (!payload || typeof payload !== "object") return false;
  const data = (payload as { data?: unknown }).data;
  return (
    Array.isArray(data) &&
    data.length === expected &&
    expected > 0 &&
    data.every(
      (ticket) =>
        ticket?.status === "ok" &&
        typeof ticket.id === "string" &&
        ticket.id.length > 0,
    )
  );
}
export async function sendPending(limit = 100) {
  const rows = await db.notification.findMany({
    where: { status: "PENDING" },
    take: limit,
    include: { detection: true },
  });
  for (const n of rows) {
    const devices = await db.device.findMany({ where: { userId: n.userId } });
    if (!devices.length) continue;
    try {
      const r = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          devices.map((d) => ({
            to: d.expoToken,
            title: "Nova oportunidade encontrada",
            body: n.detection.title.slice(0, 160),
            data: { url: n.detection.url, notificationId: n.id },
          })),
        ),
        signal: AbortSignal.timeout(10000),
      });
      if (!r.ok) throw new Error("Expo HTTP " + r.status);
      const result: unknown = await r.json();
      if (!acceptedPushTickets(result, devices.length))
        throw new Error("Expo não confirmou todos os tickets de envio");
      await db.notification.update({
        where: { id: n.id },
        data: { status: "SENT", sentAt: new Date() },
      });
    } catch (e) {
      console.error("Erro push", n.id, e);
    }
  }
}
