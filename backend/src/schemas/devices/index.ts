import { z } from "zod";
export const deviceSchema = z.object({
  expoToken: z
    .string()
    .regex(/^ExponentPushToken\[[^\]]+\]$|^ExpoPushToken\[[^\]]+\]$/),
});
