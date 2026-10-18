import { z } from "zod";
import { uuid } from "../monitors/index.js";
export const feedbackSchema = z.object({
  notificationId: uuid,
  useful: z.boolean(),
  savedMoney: z.number().nonnegative().optional(),
});
