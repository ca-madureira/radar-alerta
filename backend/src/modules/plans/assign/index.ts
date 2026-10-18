import { httpFunction } from "../../../config/functions.js";
export default httpFunction(
  "src/modules/plans/assign/handler.handler",
  "POST",
  "/admin/plan",
);
