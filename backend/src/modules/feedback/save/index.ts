import { httpFunction } from "../../../config/functions.js";
export default httpFunction(
  "src/modules/feedback/save/handler.handler",
  "POST",
  "/feedback",
);
