import { AppShell } from '../layout/AppShell'

export function ExportsPage() {
  return (
    <AppShell
      title="Exports"
      description="Exportez vos données sportives au format PDF avec les filtres actifs."
    >
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
        <h2 className="text-xl font-semibold">Page des exports</h2>
        <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
          Cette page contiendra le dialogue d&apos;export et les options de période pour les rapports.
        </p>
      </div>
    </AppShell>
  )
}
