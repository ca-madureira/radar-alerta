import { publicHandler } from "../../../middleware/http.js";
import { response } from "../../../utils/http.js";
import { searchConfigured } from "../../../services/search-config.js";

export const handler = publicHandler(async (e) => {
  return response(200, {
    ok: true,
    capabilities: { webSearch: searchConfigured() },
  });
});
