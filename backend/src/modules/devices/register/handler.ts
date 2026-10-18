import { authenticatedHandler } from "../../../middleware/http.js";
import { response } from "../../../utils/http.js";
import { db } from "../../../database/index.js";
import { deviceSchema } from "../../../schemas/devices/index.js";
import { parseBody as parse } from "../../../utils/http.js";
export const handler = authenticatedHandler(async (e, userId) => {
  const { expoToken } = deviceSchema.parse(parse(e));
  return response(
    200,
    await db.device.upsert({
      where: { expoToken },
      create: { userId, expoToken },
      update: { userId },
    }),
  );
});
