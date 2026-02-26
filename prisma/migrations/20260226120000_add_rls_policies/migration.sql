-- Enable RLS on key tables and add policies for authenticated users

-- Zones (global, no workspace_id — all authenticated users can read/manage)
ALTER TABLE "zones" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Zones are readable by authenticated users"
  ON "zones" FOR SELECT TO authenticated USING (true);

CREATE POLICY "Zones are insertable by authenticated users"
  ON "zones" FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Zones are updatable by authenticated users"
  ON "zones" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Zones are deletable by authenticated users"
  ON "zones" FOR DELETE TO authenticated USING (true);

-- Projects (workspace-scoped)
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Projects are readable by workspace members"
  ON "projects" FOR SELECT TO authenticated
  USING (workspace_id = get_auth_workspace_id());

CREATE POLICY "Projects are insertable by workspace members"
  ON "projects" FOR INSERT TO authenticated
  WITH CHECK (workspace_id = get_auth_workspace_id());

CREATE POLICY "Projects are updatable by workspace members"
  ON "projects" FOR UPDATE TO authenticated
  USING (workspace_id = get_auth_workspace_id())
  WITH CHECK (workspace_id = get_auth_workspace_id());

CREATE POLICY "Projects are deletable by workspace members"
  ON "projects" FOR DELETE TO authenticated
  USING (workspace_id = get_auth_workspace_id());

-- Contacts (workspace-scoped)
ALTER TABLE "contacts" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contacts are readable by workspace members"
  ON "contacts" FOR SELECT TO authenticated
  USING (workspace_id = get_auth_workspace_id());

CREATE POLICY "Contacts are insertable by workspace members"
  ON "contacts" FOR INSERT TO authenticated
  WITH CHECK (workspace_id = get_auth_workspace_id());

CREATE POLICY "Contacts are updatable by workspace members"
  ON "contacts" FOR UPDATE TO authenticated
  USING (workspace_id = get_auth_workspace_id())
  WITH CHECK (workspace_id = get_auth_workspace_id());

CREATE POLICY "Contacts are deletable by workspace members"
  ON "contacts" FOR DELETE TO authenticated
  USING (workspace_id = get_auth_workspace_id());

-- Listings (workspace-scoped)
ALTER TABLE "listings" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Listings are readable by workspace members"
  ON "listings" FOR SELECT TO authenticated
  USING (workspace_id = get_auth_workspace_id());

CREATE POLICY "Listings are insertable by workspace members"
  ON "listings" FOR INSERT TO authenticated
  WITH CHECK (workspace_id = get_auth_workspace_id());

CREATE POLICY "Listings are updatable by workspace members"
  ON "listings" FOR UPDATE TO authenticated
  USING (workspace_id = get_auth_workspace_id())
  WITH CHECK (workspace_id = get_auth_workspace_id());

CREATE POLICY "Listings are deletable by workspace members"
  ON "listings" FOR DELETE TO authenticated
  USING (workspace_id = get_auth_workspace_id());
