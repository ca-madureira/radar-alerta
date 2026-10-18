import { authenticatedHandler } from "../middleware/http.js";
import { response } from "../utils/http.js";
export const handler = authenticatedHandler(async () =>
  response(404, { error: "Rota n?o encontrada" }),
);
