-- App data is accessed exclusively through the authenticated Lambda API.
-- No client policies: anonymous/authenticated Supabase REST clients cannot read
-- or write these tables. The database owner used by Prisma bypasses RLS.
BEGIN;
ALTER TABLE public."Plan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."UserPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Monitor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Source" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Detection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Device" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Feedback" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CatalogSource" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DiscoveryQuery" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DiscoveredResult" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TemporalPreference" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
COMMIT;
