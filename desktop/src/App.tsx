import { useEffect } from 'react'
import './App.css'
import { useAppStore } from './store/app'
import SetupPage from './pages/SetupPage'
import HomePage from './pages/HomePage'
import ProjectPage from './pages/ProjectPage'

function App() {
  const { state, setState } = useAppStore()

  useEffect(() => {
    // TODO: load settings from tauri-plugin-store
    // For now, go straight to home (no setup needed yet)
    setState('home')
  }, [setState])

  if (state === 'loading') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', color: 'var(--text-3)', fontFamily: 'var(--font-mono)',
        fontSize: '11px', letterSpacing: '0.1em',
      }}>
        carregando...
      </div>
    )
  }

  if (state === 'setup') return <SetupPage />
  if (state === 'project') return <ProjectPage />
  return <HomePage />
}

export default App
