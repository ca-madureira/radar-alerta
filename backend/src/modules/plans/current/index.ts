import { httpFunction } from "../../../config/functions.js";
export default httpFunction(
  "src/modules/plans/current/handler.handler",
  "GET",
  "/me/plan",
);
