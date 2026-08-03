import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../auth/useAuth'

const navItems = [
  { label: 'Tableau de bord', path: '/' },
  { label: 'Compétitions', path: '/competitions' },
  { label: 'Exports', path: '/exports' },
  { label: 'Paramètres', path: '/settings' }
]

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const auth = useAuth()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            aria-hidden="true"
          />

          {/* Sidebar Panel */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="fixed inset-y-0 left-0 z-50 w-72 flex-col border-r border-slate-200 bg-white p-6 text-slate-900 shadow-lg dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 lg:hidden"
          >
            <div className="mb-10">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Athletes Tracker</p>
              <h2 className="mt-4 text-2xl font-semibold">Administration</h2>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Gérez vos compétitions et exports depuis un espace sécurisé.
              </p>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <button
              type="button"
              onClick={() => {
                auth.signOut()
                onClose()
              }}
              className="mt-auto w-full rounded-2xl border border-slate-200 bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 dark:border-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Déconnexion
            </button>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
