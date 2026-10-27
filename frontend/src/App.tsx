import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import ClubsPage from './pages/ClubsPage'
import EventsPage from './pages/EventsPage'
import JoinClubPage from './pages/JoinClubPage'
import ApplyClubPage from './pages/ApplyClubPage'
import AdminDashboardPage from './pages/AdminDashboardPage'

// The cinematic landing page pulls in three.js — keep it off the app bundle.
const LandingPage = lazy(() => import('./pages/LandingPage'))

/** Redirects to the login page, preserving the URL the user was trying to reach. */
function RequireAuth({ children }: { children: React.ReactElement }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return children
}

/** Sends already-authenticated users away from the login screen. */
function RedirectIfAuthed({ children }: { children: React.ReactElement }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) {
    return <Navigate to="/clubs" replace />
  }
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public landing page — shown whenever the site is opened. */}
      <Route
        path="/"
        element={
          <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <LandingPage />
          </Suspense>
        }
      />

      <Route
        path="/login"
        element={
          <RedirectIfAuthed>
            <LoginPage />
          </RedirectIfAuthed>
        }
      />

      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="clubs" element={<ClubsPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="joinclub" element={<JoinClubPage />} />
        <Route path="applyclub" element={<ApplyClubPage />} />
        <Route path="admin" element={<AdminDashboardPage />} />
      </Route>

      {/* Anything unmatched lands on the landing page. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
