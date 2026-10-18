import { scheduledFunction } from "../../../config/functions.js";
export default scheduledFunction(
  "src/modules/jobs/monitor/handler.handler",
  "rate(15 minutes)",
  1024,
);
