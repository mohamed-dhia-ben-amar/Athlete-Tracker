import { useMemo } from 'react'
import { useAuth } from '../auth/useAuth'

const statistics = [
  { label: 'Compétitions totales', value: '0' },
  { label: 'Aujourd hui', value: '0' },
  { label: 'À venir', value: '0' },
  { label: 'Terminées', value: '0' }
]

export function DashboardPage() {
  const auth = useAuth()
  const greeting = useMemo(() => auth.user?.email ?? 'utilisateur', [auth.user])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white/80 px-6 py-5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Tableau de bord
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Bienvenue, {greeting}</h1>
          </div>
          <button
            onClick={() => void auth.signOut()}
            className="inline-flex items-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="p-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statistics.map((item) => (
            <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          <h2 className="text-xl font-semibold">Vue d&apos;ensemble</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
            Cet espace servira de point de départ pour gérer les compétitions, les filtres,
            les exports et le suivi des résultats.
          </p>
        </section>
      </main>
    </div>
  )
}
