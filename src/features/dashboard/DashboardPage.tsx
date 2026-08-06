import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/useAuth'
import { AppShell } from '../layout/AppShell'
import { fetchCompetitions } from '../../services/competitionService'
import { fetchAthletes } from '../../services/athleteService'
import { fetchTeams } from '../../services/teamService'
import type { CompetitionRecord } from '../../types/competition'
import { CompetitionTable } from './CompetitionTable'

function countToday(records: CompetitionRecord[]) {
  const today = new Date().toLocaleDateString('fr-FR')
  return records.filter((record) => {
    return new Date(record.date_heure).toLocaleDateString('fr-FR') === today
  }).length
}

export function DashboardPage() {
  const auth = useAuth()
  const greeting = useMemo(() => auth.user?.email ?? 'utilisateur', [auth.user])
  const { data: competitions = [], isLoading, isError } = useQuery(['competitions'], fetchCompetitions)
  const { data: athletes = [] } = useQuery(['athletes'], fetchAthletes)
  const { data: teams = [] } = useQuery(['teams'], fetchTeams)

  const statistics = useMemo(
    () => [
      { label: 'Compétitions totales', value: competitions.length.toString() },
      { label: "Aujourd'hui", value: countToday(competitions).toString() },
      { label: 'À venir', value: competitions.filter((item) => item.statut === 'À venir').length.toString() },
      { label: 'Terminées', value: competitions.filter((item) => item.statut === 'Terminée').length.toString() },
      { label: 'Nombre d\'athlètes', value: athletes.length.toString() },
      { label: 'Nombre d\'équipes', value: teams.length.toString() }
    ],
    [competitions, athletes, teams]
  )

  return (
    <AppShell
      title="Tableau de bord"
      description="Suivez les performances, l’activité et les compétitions à venir."
    >
      <section className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {statistics.map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-6"
          >
            <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100 sm:mt-4 sm:text-3xl">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:mt-8 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold sm:text-xl">Vue d&apos;ensemble</h2>
            <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400 sm:mt-2 sm:text-sm sm:leading-7">
              Bienvenue, {greeting}. Cet espace sert de point de départ pour gérer les compétitions,
              les filtres, les exports et le suivi des résultats.
            </p>
          </div>
        </div>

        <CompetitionTable records={competitions} isLoading={isLoading} isError={isError} />
      </section>
    </AppShell>
  )
}