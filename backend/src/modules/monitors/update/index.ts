import { httpFunction } from "../../../config/functions.js";
export default httpFunction(
  "src/modules/monitors/update/handler.handler",
  "PATCH",
  "/monitors/{id}",
);
