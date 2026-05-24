export interface Task {
  id: string
  title: string
  done: boolean
  created_at: string
}

export interface Milestone {
  id: string
  title: string
  description?: string
  estimated_days: number
  tasks: Task[]
  completed: boolean
  order: number
}

export interface Checkin {
  id: string
  at: string
  note: string
  milestone_id: string
}

export interface Project {
  id: string
  name: string
  repo_path: string
  description?: string
  current_milestone_id?: string
  milestones: Milestone[]
  checkins: Checkin[]
  created_at: string
  last_activity_at: string
}

export interface UserSettings {
  api_provider: 'anthropic' | 'openai' | 'google'
  api_key: string
  theme: 'dark' | 'light'
  supabase_user_id?: string
}

export type AppState = 'loading' | 'setup' | 'home' | 'project'
