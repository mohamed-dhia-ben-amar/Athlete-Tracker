import { Navigate, useLocation } from 'react-router-dom'
import React from 'react'
import { useAuth } from './useAuth'

export function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const auth = useAuth()
  const location = useLocation()

  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p>Chargement de la session…</p>
        </div>
      </div>
    )
  }

  if (!auth.session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
