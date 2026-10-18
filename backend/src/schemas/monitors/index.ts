import { z } from "zod";
import { defaultTemporal } from "../../services/temporal.js";
export const uuid = z.string().uuid();
export const monitorSchema = z.object({
  name: z.string().min(2).max(120),
  keywords: z.array(z.string().trim().min(2).max(100)).min(1).max(15),
  excludeKeywords: z
    .array(z.string().trim().min(2).max(100))
    .max(15)
    .default([]),
  matchMode: z.enum(["ANY", "ALL"]).default("ANY"),
  urls: z.array(z.string().url()).max(10).default([]),
  catalogIds: z.array(z.string().uuid()).max(20).default([]),
  searchWeb: z.boolean().default(false),
  temporal: z
    .object({
      dateBasis: z
        .enum(["PUBLISHED", "UPDATED", "DISCOVERED"])
        .default("PUBLISHED"),
      lookbackDays: z.number().int().min(0).max(365).default(7),
      since: z.string().datetime().nullable().default(null),
      onlyNew: z.boolean().default(true),
      notifyUpdates: z.boolean().default(true),
      requireVerifiedDate: z.boolean().default(true),
    })
    .default({ ...defaultTemporal, since: null }),
});
export const updateMonitorSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    status: z.enum(["ACTIVE", "PAUSED"]).optional(),
    keywords: monitorSchema.shape.keywords.optional(),
    excludeKeywords: monitorSchema.shape.excludeKeywords
      .removeDefault()
      .optional(),
    matchMode: z.enum(["ANY", "ALL"]).optional(),
    temporal: z
      .object({
        dateBasis: z.enum(["PUBLISHED", "UPDATED", "DISCOVERED"]),
        lookbackDays: z.number().int().min(0).max(365),
        since: z.string().datetime().nullable(),
        onlyNew: z.boolean(),
        notifyUpdates: z.boolean(),
        requireVerifiedDate: z.boolean(),
      })
      .partial()
      .optional(),
  })
  .strict();
