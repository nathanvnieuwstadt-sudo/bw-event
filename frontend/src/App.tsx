import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { BanquetListPage } from './pages/banquet/BanquetListPage'
import { BanquetDetailPage } from './pages/banquet/BanquetDetailPage'
import { BanquetFormPage } from './pages/banquet/BanquetFormPage'
import { KitchenViewPage } from './pages/kitchen/KitchenViewPage'
import { OwnerOverviewPage } from './pages/owner/OwnerOverviewPage'
import { AgentDraftPage } from './pages/agent/AgentDraftPage'
import { AgentRulesPage } from './pages/agent/AgentRulesPage'
import { ContactListPage } from './pages/contact/ContactListPage'
import { EventTypesPage } from './pages/eventtype/EventTypesPage'
import { StaffListPage } from './pages/user/StaffListPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />

              {/* Banquets — OWNER gets read-only (list + detail), managers get full CRUD */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={['DEV', 'OWNER', 'GENERAL_MANAGER', 'FLOOR_MANAGER']} />
                }
              >
                <Route path="/banquets" element={<BanquetListPage />} />
                <Route path="/banquets/new" element={<BanquetFormPage />} />
                <Route path="/banquets/:id" element={<BanquetDetailPage />} />
                <Route path="/banquets/:id/edit" element={<BanquetFormPage />} />
              </Route>

              {/* Contacts + Agent */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={['DEV', 'GENERAL_MANAGER', 'FLOOR_MANAGER']} />
                }
              >
                <Route path="/contacts" element={<ContactListPage />} />
                <Route path="/agent" element={<AgentDraftPage />} />
                <Route path="/agent/rules" element={<AgentRulesPage />} />
              </Route>

              {/* Event Types — management, DEV + GENERAL_MANAGER only */}
              <Route
                element={<ProtectedRoute allowedRoles={['DEV', 'GENERAL_MANAGER']} />}
              >
                <Route path="/event-types" element={<EventTypesPage />} />
                <Route path="/staff" element={<StaffListPage />} />
              </Route>

              {/* Kitchen */}
              <Route element={<ProtectedRoute allowedRoles={['DEV', 'KITCHEN']} />}>
                <Route path="/kitchen" element={<KitchenViewPage />} />
              </Route>

              {/* Owner overview */}
              <Route element={<ProtectedRoute allowedRoles={['DEV', 'OWNER']} />}>
                <Route path="/overview" element={<OwnerOverviewPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="/unauthorized" element={
            <div className="flex h-screen items-center justify-center text-sm text-gray-500">
              You do not have permission to view this page.
            </div>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
