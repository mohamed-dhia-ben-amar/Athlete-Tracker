import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthProvider'
import { LoginPage } from './features/auth/LoginPage'
import { SignupPage } from './features/auth/SignupPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { CompetitionsPage } from './features/competitions/CompetitionsPage'
import { ExportsPage } from './features/exports/ExportsPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { SportsPage } from './features/admin/SportsPage'
import { AthletesPage } from './features/admin/AthletesPage'
import { TeamsPage } from './features/admin/TeamsPage'
import { OfficialsPage } from './features/admin/OfficialsPage'
import { FlightsPage } from './features/flights/FlightsPage'
import { AccommodationsPage } from './features/accommodations/AccommodationsPage'
import { TimelinePage } from './features/timeline/TimelinePage'
import { ProtectedRoute } from './features/auth/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/competitions"
            element={
              <ProtectedRoute>
                <CompetitionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sports"
            element={
              <ProtectedRoute>
                <SportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/athletes"
            element={
              <ProtectedRoute>
                <AthletesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams"
            element={
              <ProtectedRoute>
                <TeamsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officials"
            element={
              <ProtectedRoute>
                <OfficialsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/flights"
            element={
              <ProtectedRoute>
                <FlightsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accommodations"
            element={
              <ProtectedRoute>
                <AccommodationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timeline"
            element={
              <ProtectedRoute>
                <TimelinePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exports"
            element={
              <ProtectedRoute>
                <ExportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}