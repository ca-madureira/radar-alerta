import { runSearch } from "../../../services/search.js";
export async function handler() {
  return runSearch();
}
