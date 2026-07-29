import { AppShell } from '../layout/AppShell'

export function CompetitionsPage() {
  return (
    <AppShell
      title="Compétitions"
      description="Consultez et gérez les compétitions sportives depuis un tableau de bord clair."
    >
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
        <h2 className="text-xl font-semibold">Page des compétitions</h2>
        <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
          Cette section affichera la liste des compétitions, les filtres et les actions de CRUD.
        </p>
      </div>
    </AppShell>
  )
}
