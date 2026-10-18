export function searchConfigured(env: NodeJS.ProcessEnv = process.env) {
  const provider = env.SEARCH_PROVIDER || "google";
  return provider === "google"
    ? Boolean(env.GOOGLE_SEARCH_API_KEY && env.GOOGLE_SEARCH_ENGINE_ID)
    : provider === "brave" && Boolean(env.BRAVE_SEARCH_API_KEY);
}
