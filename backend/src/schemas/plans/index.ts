import { z } from "zod";
import { uuid } from "../monitors/index.js";
export const assignPlanSchema = z.object({ userId: uuid, planId: z.string() });
