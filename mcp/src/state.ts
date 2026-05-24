import fs from 'fs'
import path from 'path'

export interface Task {
  title: string
  done: boolean
}

export interface Milestone {
  title: string
  description?: string
  estimated_days: number
  tasks: Task[]
}

export interface Checkin {
  at: string
  note: string
  milestone_index: number
}

export interface MomentumState {
  project_name: string
  milestones: Milestone[]
  checkins: Checkin[]
  created_at: string
}

function findStateFile(startDir: string): string | null {
  let dir = startDir
  while (true) {
    const candidate = path.join(dir, '.momentum.json')
    if (fs.existsSync(candidate)) return candidate
    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

export function loadState(cwd = process.cwd()): { state: MomentumState; filePath: string } | null {
  const filePath = findStateFile(cwd)
  if (!filePath) return null
  const state: MomentumState = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  return { state, filePath }
}

export function saveState(state: MomentumState, filePath: string): void {
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2) + '\n', 'utf-8')
}

export function createState(state: MomentumState, cwd = process.cwd()): string {
  const filePath = path.join(cwd, '.momentum.json')
  saveState(state, filePath)
  return filePath
}

export function activeMilestoneIndex(state: MomentumState): number {
  for (let i = 0; i < state.milestones.length; i++) {
    const ms = state.milestones[i]
    if (ms.tasks.some(t => !t.done)) return i
  }
  return state.milestones.length - 1
}

export function progressSummary(state: MomentumState) {
  const totalTasks = state.milestones.reduce((n, m) => n + m.tasks.length, 0)
  const doneTasks = state.milestones.reduce((n, m) => n + m.tasks.filter(t => t.done).length, 0)
  const activeIdx = activeMilestoneIndex(state)
  const active = state.milestones[activeIdx]
  const activeDone = active.tasks.filter(t => t.done).length
  return {
    project_name: state.project_name,
    total_milestones: state.milestones.length,
    active_milestone_index: activeIdx,
    active_milestone: active.title,
    active_milestone_progress: `${activeDone}/${active.tasks.length}`,
    overall_progress: `${doneTasks}/${totalTasks}`,
    overall_pct: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
    pending_tasks: active.tasks.filter(t => !t.done).map(t => t.title),
    estimated_days_remaining: active.estimated_days,
  }
}
