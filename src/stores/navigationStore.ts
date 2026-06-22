import { create } from 'zustand'

interface NavigationState {
  currentDatabaseId: string | null
  currentFolderId: string | null
  currentFolderName: string | null
  selectedEntryId: string | null

  setDatabase: (dbId: string) => void
  setFolder: (folderId: string | null, folderName?: string | null) => void
  selectEntry: (entryId: string | null) => void
  reset: () => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentDatabaseId: null,
  currentFolderId: null,
  currentFolderName: null,
  selectedEntryId: null,

  setDatabase: (dbId) =>
    set({
      currentDatabaseId: dbId,
      currentFolderId: null,
      currentFolderName: null,
      selectedEntryId: null,
    }),

  setFolder: (folderId, folderName) =>
    set({
      currentFolderId: folderId,
      currentFolderName: folderName ?? null,
      selectedEntryId: null,
    }),

  selectEntry: (entryId) => set({ selectedEntryId: entryId }),

  reset: () =>
    set({
      currentDatabaseId: null,
      currentFolderId: null,
      currentFolderName: null,
      selectedEntryId: null,
    }),
}))
