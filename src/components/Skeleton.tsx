import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <motion.div
      className={`bg-slate-200 dark:bg-slate-800 ${className}`}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      style={{}}
    />
  )
}

export function TableSkeletonRow() {
  return (
    <tr>
      <td className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <Skeleton className="h-4 rounded" />
      </td>
      <td className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <Skeleton className="h-4 rounded" />
      </td>
      <td className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <Skeleton className="h-4 rounded" />
      </td>
      <td className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <Skeleton className="h-4 rounded" />
      </td>
      <td className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <Skeleton className="h-8 w-16 rounded-full" />
      </td>
    </tr>
  )
}

export function CompetitionTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <table className="w-full">
        <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              <Skeleton className="h-4 w-24 rounded" />
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              <Skeleton className="h-4 w-32 rounded" />
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              <Skeleton className="h-4 w-28 rounded" />
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              <Skeleton className="h-4 w-20 rounded" />
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              <Skeleton className="h-4 w-16 rounded" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableSkeletonRow key={i} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
