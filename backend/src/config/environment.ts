// Serverless resolves these references when packaging or deploying the service.
export const environment = {
  DATABASE_URL: "${env:DATABASE_URL}",
  DIRECT_URL: "${env:DIRECT_URL}",
  SUPABASE_URL: "${env:SUPABASE_URL}",
  SUPABASE_ANON_KEY: "${env:SUPABASE_ANON_KEY}",
  ADMIN_USER_IDS: "${env:ADMIN_USER_IDS, ''}",
  SEARCH_PROVIDER: "${env:SEARCH_PROVIDER, 'google'}",
  GOOGLE_SEARCH_API_KEY: "${env:GOOGLE_SEARCH_API_KEY, ''}",
  GOOGLE_SEARCH_ENGINE_ID: "${env:GOOGLE_SEARCH_ENGINE_ID, ''}",
  BRAVE_SEARCH_API_KEY: "${env:BRAVE_SEARCH_API_KEY, ''}",
};
