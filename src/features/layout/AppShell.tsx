import { type ReactNode, useState } from 'react'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '../auth/useAuth'

interface AppShellProps {
  title: string
  description: string
  children: ReactNode
}

export function AppShell({ title, description, children }: AppShellProps) {
  const auth = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <div className="flex w-full flex-1 flex-col lg:min-h-screen">
          {/* Header */}
          <header className="border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:px-6 sm:py-4">
            <div className="flex flex-col gap-4 sm:gap-6">
              {/* Top Row: Menu + Theme */}
              <div className="flex items-center justify-between gap-2">
                {/* Hamburger Menu - Mobile Only */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900 lg:hidden"
                  aria-label="Ouvrir le menu"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                <ThemeToggle />
              </div>

              {/* Title Section */}
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Espace fédération</p>
                <h1 className="mt-1 truncate text-xl sm:text-2xl md:text-3xl font-semibold">{title}</h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">{description}</p>
              </div>

              {/* Logout Button - Desktop */}
              <div className="hidden sm:flex">
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

          {/* Main Content */}
          <main className="flex-1 overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </div>
  )
}
