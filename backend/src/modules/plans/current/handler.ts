import { authenticatedHandler } from "../../../middleware/http.js";
import { response } from "../../../utils/http.js";
import { userPlan } from "../../../services/plans.js";
export const handler = authenticatedHandler(async (e, userId) => {
  return response(200, await userPlan(userId));
});
