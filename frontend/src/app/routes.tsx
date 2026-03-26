import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth, RequireRole } from '@/lib/auth/guards'
import AppShell from '@/components/layout/AppShell'
import DashboardPage from '@/pages/DashboardPage'
import GroupsPage from '@/pages/GroupsPage'
import IncidentDetailPage from '@/pages/IncidentDetailPage'
import IncidentManagementPage from '@/pages/IncidentManagementPage'
import LoginPage from '@/pages/LoginPage'
import ManualDetailPage from '@/pages/ManualDetailPage'
import ManualsPage from '@/pages/ManualsPage'
import MeetingDetailPage from '@/pages/MeetingDetailPage'
import MeetingManagementPage from '@/pages/MeetingManagementPage'
import NotificationDetailPage from '@/pages/NotificationDetailPage'
import NotificationsPage from '@/pages/NotificationsPage'
import NotAuthorizedPage from '@/pages/NotAuthorizedPage'
import RiskDetailPage from '@/pages/RiskDetailPage'
import UnsignedWorksPage from '@/pages/UnsignedWorksPage'
import WorkCreatePage from '@/pages/WorkCreatePage'
import WorkDetailPage from '@/pages/WorkDetailPage'
import WorksExplorerPage from '@/pages/WorksExplorerPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="unsigned-works" element={<UnsignedWorksPage />} />
        <Route path="risk/:riskId" element={<RiskDetailPage />} />
        <Route path="meetings" element={<MeetingManagementPage />} />
        <Route path="meetings/:meetingId" element={<MeetingDetailPage />} />
        <Route path="incidents" element={<IncidentManagementPage />} />
        <Route path="incidents/:incidentId" element={<IncidentDetailPage />} />
        <Route path="manuals" element={<ManualsPage />} />
        <Route path="manuals/:manualId" element={<ManualDetailPage />} />
        <Route
          path="notifications"
          element={
            <RequireRole allowed={['leader', 'safety_manager']}>
              <NotificationsPage />
            </RequireRole>
          }
        />
        <Route
          path="notifications/:notificationId"
          element={
            <RequireRole allowed={['leader', 'safety_manager']}>
              <NotificationDetailPage />
            </RequireRole>
          }
        />
        <Route path="works/explorer" element={<WorksExplorerPage />} />
        <Route path="works/:workId" element={<WorkDetailPage />} />
        <Route
          path="groups"
          element={
            <RequireRole allowed={['leader']}>
              <GroupsPage />
            </RequireRole>
          }
        />
        <Route
          path="works/new"
          element={
            <RequireRole allowed={['leader']}>
              <WorkCreatePage />
            </RequireRole>
          }
        />
        <Route path="forbidden" element={<NotAuthorizedPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
