import { scheduledFunction } from "../../../config/functions.js";
export default scheduledFunction(
  "src/modules/jobs/search/handler.handler",
  "rate(1 hour)",
);
