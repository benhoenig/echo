-- Add workspace_id column
ALTER TABLE comments ADD COLUMN workspace_id UUID;

-- Since the table is empty and we want to enforce it, add NOT NULL constraint
ALTER TABLE comments ALTER COLUMN workspace_id SET NOT NULL;

-- Create an index
CREATE INDEX comments_workspace_id_idx ON comments (workspace_id);

-- Add foreign key constraint
ALTER TABLE comments ADD CONSTRAINT comments_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- Add RLS policies for comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments in their workspace"
    ON comments FOR SELECT
    USING (
        workspace_id = get_auth_workspace_id()
    );

CREATE POLICY "Users can insert comments in their workspace"
    ON comments FOR INSERT
    WITH CHECK (
        workspace_id = get_auth_workspace_id()
    );

CREATE POLICY "Users can update their own comments"
    ON comments FOR UPDATE
    USING (
        workspace_id = get_auth_workspace_id() AND author_user_id = auth.uid()
    )
    WITH CHECK (
        workspace_id = get_auth_workspace_id() AND author_user_id = auth.uid()
    );
