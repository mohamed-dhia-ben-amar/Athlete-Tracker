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
import { CompetitionTableSkeleton } from '../../components/Skeleton'

interface CompetitionTableProps {
  records: CompetitionRecord[]
  isLoading: boolean
  isError: boolean
  onEdit?: (record: CompetitionRecord) => void
  onDelete?: (record: CompetitionRecord) => void
}

const pageSizes = [5, 10, 20]

export function CompetitionTable({ records, isLoading, isError, onEdit, onDelete }: CompetitionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const columns = useMemo<ColumnDef<CompetitionRecord>[]>(
    () => {
      const baseColumns: ColumnDef<CompetitionRecord>[] = [
        { header: 'Participant', accessorKey: 'participant_name' },
        { header: 'Sport', accessorKey: 'sport_type' },
        { header: 'Discipline', accessorKey: 'discipline' },
        { header: 'Compétition', accessorKey: 'competition_name' },
        {
          header: 'Date',
          accessorKey: 'competition_datetime',
          cell: (info) => new Date(info.getValue() as string).toLocaleDateString('fr-FR')
        },
        { header: 'Statut', accessorKey: 'status' }
      ]

      if (onEdit || onDelete) {
        baseColumns.push({
          id: 'actions',
          header: 'Actions',
          cell: ({ row }) => (
            <div className="flex flex-wrap gap-2">
              {onEdit ? (
                <button
                  type="button"
                  onClick={() => onEdit(row.original)}
                  className="rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  Éditer
                </button>
              ) : null}
              {onDelete ? (
                <button
                  type="button"
                  onClick={() => onDelete(row.original)}
                  className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-700 dark:bg-red-950 dark:text-red-200 dark:hover:bg-red-900"
                >
                  Supprimer
                </button>
              ) : null}
            </div>
          )
        })
      }

      return baseColumns
    },
    [onDelete, onEdit]
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

  if (isLoading) {
    return <CompetitionTableSkeleton />
  }

  if (isError) {
    return (
      <div className="flex justify-center rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
        <p className="font-semibold">Erreur lors du chargement des données</p>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="flex justify-center rounded-2xl border border-slate-200 bg-slate-50 p-8 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <p className="font-medium">Aucune compétition trouvée. Créez votre première compétition!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mobile: Card View */}
      <div className="space-y-4 md:hidden">
        {table.getRowModel().rows.map((row) => (
          <div key={row.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Participant</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{row.original.participant_name}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Sport</p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{row.original.sport_type}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Statut</p>
                  <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    row.original.status === 'À venir'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : row.original.status === 'En cours'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : row.original.status === 'Terminée'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {row.original.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Discipline</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{row.original.discipline}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Compétition</p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{row.original.competition_name}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Date</p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                    {new Date(row.original.competition_datetime).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Heure</p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                    {new Date(row.original.competition_datetime).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {row.original.location && (
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Lieu</p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{row.original.location}</p>
                </div>
              )}

              {row.original.result && (
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Résultat</p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{row.original.result}</p>
                </div>
              )}

              {(onEdit || onDelete) && (
                <div className="flex gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(row.original)}
                      className="flex-1 rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                      Éditer
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(row.original)}
                      className="flex-1 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-700 dark:bg-red-950 dark:text-red-200 dark:hover:bg-red-900"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table View */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-slate-200 dark:border-slate-800">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer select-none bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-700 transition hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() && (
                        <span className="text-slate-900 dark:text-slate-100">
                          {header.column.getIsSorted() === 'desc' ? ' ↓' : ' ↑'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-200 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {pageSizes.map((pageSize) => (
            <button
              key={pageSize}
              onClick={() => table.setPageSize(pageSize)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                table.getState().pagination.pageSize === pageSize
                  ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900'
              }`}
            >
              {pageSize} / page
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            ← Précédent
          </button>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            Suivant →
          </button>
        </div>
      </div>
    </div>
  )
}
