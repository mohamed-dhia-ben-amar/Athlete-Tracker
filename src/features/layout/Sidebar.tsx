import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Tableau de bord', path: '/' },
  { label: 'Compétitions', path: '/competitions' },
  { label: 'Exports', path: '/exports' },
  { label: 'Paramètres', path: '/settings' }
]

export function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-slate-200 bg-white p-6 text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 xl:flex">
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

      <div className="mt-auto rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="font-semibold text-slate-900 dark:text-slate-100">Interface moderne</p>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Une base responsive et accessible pour le dashboard sportif.
        </p>
      </div>
    </aside>
  )
}
