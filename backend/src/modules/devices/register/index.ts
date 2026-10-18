import { httpFunction } from "../../../config/functions.js";
export default httpFunction(
  "src/modules/devices/register/handler.handler",
  "POST",
  "/devices",
);
