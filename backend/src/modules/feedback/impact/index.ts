import { httpFunction } from "../../../config/functions.js";
export default httpFunction(
  "src/modules/feedback/impact/handler.handler",
  "GET",
  "/me/impact",
);
