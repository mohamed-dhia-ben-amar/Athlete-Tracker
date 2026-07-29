import { useTheme } from '../../hooks/useTheme'

export function ThemeToggle() {
  const [theme, toggleTheme] = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-800"
    >
      {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
    </button>
  )
}
