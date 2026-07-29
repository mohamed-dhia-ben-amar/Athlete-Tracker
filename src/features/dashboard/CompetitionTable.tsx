import { useMemo, useState } from 'react'
import {
  flexRender,
  type ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type SortingState
} from '@tanstack/react-table'
import type { CompetitionRecord } from '../../types/competition'

interface CompetitionTableProps {
  records: CompetitionRecord[]
  isLoading: boolean
  isError: boolean
}

const pageSizes = [5, 10, 20]

export function CompetitionTable({ records, isLoading, isError }: CompetitionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

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
    state: {
      sorting,
      pagination
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
    debugTable: false
  })

  const pageCount = table.getPageCount()

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
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Affichage {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} -{' '}
          {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, records.length)} sur {records.length}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="text-sm text-slate-600 dark:text-slate-300">
            Lignes par page :
            <select
              value={pagination.pageSize}
              onChange={(event) => setPagination((prev) => ({ ...prev, pageSize: Number(event.target.value), pageIndex: 0 }))}
              className="ml-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-b border-slate-200 px-3 py-3 font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200"
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        className="inline-flex items-center gap-2"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: '↑', desc: '↓' }[header.column.getIsSorted() as string] ?? '↕'}
                      </button>
                    )}
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Page {table.getState().pagination.pageIndex + 1} sur {pageCount}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            Précédent
          </button>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  )
}
