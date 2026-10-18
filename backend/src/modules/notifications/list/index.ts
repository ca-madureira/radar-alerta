import { httpFunction } from "../../../config/functions.js";
export default httpFunction(
  "src/modules/notifications/list/handler.handler",
  "GET",
  "/notifications",
);
