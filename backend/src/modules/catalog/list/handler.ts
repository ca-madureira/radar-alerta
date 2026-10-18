import { authenticatedHandler } from "../../../middleware/http.js";
import { response } from "../../../utils/http.js";
import { db } from "../../../database/index.js";
export const handler = authenticatedHandler(async (e, userId) => {
  return response(
    200,
    await db.catalogSource.findMany({
      where: { active: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      take: 200,
    }),
  );
});
