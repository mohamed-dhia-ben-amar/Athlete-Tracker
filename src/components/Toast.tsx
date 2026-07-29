import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, AlertCircle, X } from 'lucide-react'

interface ToastProps {
  id: string
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose: (id: string) => void
}

export function Toast({ id, message, type = 'info', duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration)
    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const bgColor =
    type === 'success'
      ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800'
      : type === 'error'
        ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
        : 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'

  const textColor =
    type === 'success'
      ? 'text-emerald-800 dark:text-emerald-200'
      : type === 'error'
        ? 'text-red-800 dark:text-red-200'
        : 'text-blue-800 dark:text-blue-200'

  const iconColor =
    type === 'success'
      ? 'text-emerald-600 dark:text-emerald-400'
      : type === 'error'
        ? 'text-red-600 dark:text-red-400'
        : 'text-blue-600 dark:text-blue-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`border ${bgColor} rounded-2xl p-4 shadow-lg`}
    >
      <div className="flex items-center gap-3">
        {type === 'success' && <Check className={`h-5 w-5 flex-shrink-0 ${iconColor}`} />}
        {type === 'error' && <AlertCircle className={`h-5 w-5 flex-shrink-0 ${iconColor}`} />}
        <p className={`flex-1 text-sm font-medium ${textColor}`}>{message}</p>
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 rounded-full p-1 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
        >
          <X className={`h-4 w-4 ${textColor}`} />
        </button>
      </div>
    </motion.div>
  )
}

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type?: 'success' | 'error' | 'info' }>
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="pointer-events-none fixed right-0 top-0 z-[9999] flex flex-col gap-3 p-6">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast id={toast.id} message={toast.message} type={toast.type} onClose={onClose} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
