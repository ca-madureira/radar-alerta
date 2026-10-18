import { httpFunction } from "../../../config/functions.js";
export default httpFunction(
  "src/modules/monitors/list/handler.handler",
  "GET",
  "/monitors",
);
