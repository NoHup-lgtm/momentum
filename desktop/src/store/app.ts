import { create } from 'zustand'
import { Project, UserSettings, AppState } from '../types'

interface AppStore {
  state: AppState
  projects: Project[]
  activeProject: Project | null
  settings: UserSettings | null

  setState: (s: AppState) => void
  setProjects: (p: Project[]) => void
  setActiveProject: (p: Project | null) => void
  setSettings: (s: UserSettings) => void
  updateProject: (id: string, partial: Partial<Project>) => void
}

export const useAppStore = create<AppStore>((set) => ({
  state: 'loading',
  projects: [],
  activeProject: null,
  settings: null,

  setState: (s) => set({ state: s }),
  setProjects: (projects) => set({ projects }),
  setActiveProject: (activeProject) => set({ activeProject }),
  setSettings: (settings) => set({ settings }),
  updateProject: (id, partial) =>
    set((store) => ({
      projects: store.projects.map((p) => (p.id === id ? { ...p, ...partial } : p)),
      activeProject:
        store.activeProject?.id === id
          ? { ...store.activeProject, ...partial }
          : store.activeProject,
    })),
}))
