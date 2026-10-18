import { httpFunction } from "../../../config/functions.js";
export default httpFunction(
  "src/modules/common/health/handler.handler",
  "GET",
  "/health",
);
