import { useMemo } from 'react'
import { type ColumnDef, useReactTable, getCoreRowModel } from '@tanstack/react-table'
import type { CompetitionRecord } from '../../types/competition'

interface CompetitionTableProps {
  records: CompetitionRecord[]
  isLoading: boolean
  isError: boolean
}

export function CompetitionTable({ records, isLoading, isError }: CompetitionTableProps) {
  const columns = useMemo<ColumnDef<CompetitionRecord>[]>(
    () => [
      { header: 'Participant', accessorKey: 'participant_name' },
      { header: 'Type', accessorKey: 'participant_type' },
      { header: 'Sport', accessorKey: 'sport_type' },
      { header: 'Discipline', accessorKey: 'discipline' },
      { header: 'Compétition', accessorKey: 'competition_name' },
      {
        header: 'Date',
        accessorKey: 'competition_datetime',
        cell: (info) => new Date(info.getValue() as string).toLocaleDateString('fr-FR')
      },
      {
        header: 'Heure',
        accessorKey: 'competition_datetime',
        cell: (info) => new Date(info.getValue() as string).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      },
      { header: 'Lieu', accessorKey: 'location' },
      { header: 'Étape', accessorKey: 'stage' },
      { header: 'Statut', accessorKey: 'status' },
      { header: 'Résultat', accessorKey: 'result' }
    ],
    []
  )

  const table = useReactTable({
    data: records,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
        Chargement des compétitions…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
        Impossible de charger les compétitions. Vérifiez votre connexion.
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        Aucune compétition trouvée pour le moment.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="border-b border-slate-200 px-3 py-3 font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200"
                >
                  {header.isPlaceholder ? null : header.renderHeader()}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-3 text-slate-700 dark:text-slate-200">
                  {cell.renderCell()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
