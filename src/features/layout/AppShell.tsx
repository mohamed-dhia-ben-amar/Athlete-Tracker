import { type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '../auth/useAuth'

interface AppShellProps {
  title: string
  description: string
  children: ReactNode
}

export function AppShell({ title, description, children }: AppShellProps) {
  const auth = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Espace fédération</p>
                <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ThemeToggle />
                <button
                  type="button"
                  onClick={() => void auth.signOut()}
                  className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:border-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 xl:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
