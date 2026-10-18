import { runWorker } from "../../../services/worker.js";
export async function handler() {
  const result = await runWorker();
  console.log(result);
  return result;
}
