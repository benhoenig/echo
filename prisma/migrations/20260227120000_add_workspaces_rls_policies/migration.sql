-- Enable RLS on workspaces table and add policies for workspace members
-- The workspaces table uses `id` (not `workspace_id`) to identify the workspace

ALTER TABLE "workspaces" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspaces are readable by their members"
  ON "workspaces" FOR SELECT TO authenticated
  USING (id = get_auth_workspace_id());

CREATE POLICY "Workspaces are updatable by their members"
  ON "workspaces" FOR UPDATE TO authenticated
  USING (id = get_auth_workspace_id())
  WITH CHECK (id = get_auth_workspace_id());
