import { AppShell } from '../layout/AppShell'

export function SettingsPage() {
  return (
    <AppShell
      title="Paramètres"
      description="Ajustez les préférences utilisateur et la présentation de l'application."
    >
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
        <h2 className="text-xl font-semibold">Paramètres</h2>
        <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
          Les réglages de l&apos;application seront disponibles ici, y compris le thème et la gestion du compte.
        </p>
      </div>
    </AppShell>
  )
}
