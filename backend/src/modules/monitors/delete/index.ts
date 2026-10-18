import { httpFunction } from "../../../config/functions.js";
export default httpFunction(
  "src/modules/monitors/delete/handler.handler",
  "DELETE",
  "/monitors/{id}",
);
