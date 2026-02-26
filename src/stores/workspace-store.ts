import { create } from "zustand";

interface WorkspaceStore {
    workspaceName: string | null;
    setWorkspaceName: (name: string) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
    workspaceName: null,
    setWorkspaceName: (name) => set({ workspaceName: name }),
}));
