import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/useAuth'
import { AppShell } from '../layout/AppShell'
import { fetchCompetitions } from '../../services/competitionService'
import type { CompetitionRecord } from '../../types/competition'
import { CompetitionTable } from './CompetitionTable'

function countToday(records: CompetitionRecord[]) {
  const today = new Date().toLocaleDateString('fr-FR')
  return records.filter((record) => {
    return new Date(record.competition_datetime).toLocaleDateString('fr-FR') === today
  }).length
}

export function DashboardPage() {
  const auth = useAuth()
  const greeting = useMemo(() => auth.user?.email ?? 'utilisateur', [auth.user])
  const { data = [], isLoading, isError } = useQuery(['competitions'], fetchCompetitions)

  const statistics = useMemo(
    () => [
      { label: 'Compétitions totales', value: data.length.toString() },
      { label: 'Aujourd’hui', value: countToday(data).toString() },
      { label: 'À venir', value: data.filter((item) => item.status === 'À venir').length.toString() },
      { label: 'Terminées', value: data.filter((item) => item.status === 'Terminée').length.toString() }
    ],
    [data]
  )

  return (
    <AppShell
      title="Tableau de bord"
      description="Suivez les performances, l’activité et les compétitions à venir."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statistics.map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Vue d&apos;ensemble</h2>
            <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
              Bienvenue, {greeting}. Cet espace sert de point de départ pour gérer les compétitions,
              les filtres, les exports et le suivi des résultats.
            </p>
          </div>
        </div>

        <CompetitionTable records={data} isLoading={isLoading} isError={isError} />
      </section>
    </AppShell>
  )
}
