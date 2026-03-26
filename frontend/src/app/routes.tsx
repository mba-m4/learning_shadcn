import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth, RequireRole } from '@/shared/auth/guards'
import AppShell from '@/components/layout/AppShell'
import LoginPage from '@/features/auth/pages/LoginPage'
import NotAuthorizedPage from '@/features/auth/pages/NotAuthorizedPage'
import IncidentDetailPage from '@/features/incidents/pages/IncidentDetailPage'
import IncidentManagementPage from '@/features/incidents/pages/IncidentManagementPage'
import ManualDetailPage from '@/features/manuals/pages/ManualDetailPage'
import ManualsPage from '@/features/manuals/pages/ManualsPage'
import MeetingDetailPage from '@/features/meetings/pages/MeetingDetailPage'
import MeetingManagementPage from '@/features/meetings/pages/MeetingManagementPage'
import NotificationDetailPage from '@/features/notifications/pages/NotificationDetailPage'
import NotificationsPage from '@/features/notifications/pages/NotificationsPage'
import RiskDetailPage from '@/features/risk-registry/pages/RiskDetailPage'
import DashboardPage from '@/features/works/pages/DashboardPage'
import GroupsPage from '@/features/works/pages/GroupsPage'
import UnsignedWorksPage from '@/features/works/pages/UnsignedWorksPage'
import WorkCreatePage from '@/features/works/pages/WorkCreatePage'
import WorkDetailPage from '@/features/works/pages/WorkDetailPage'
import WorksExplorerPage from '@/features/works/pages/WorksExplorerPage'

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
