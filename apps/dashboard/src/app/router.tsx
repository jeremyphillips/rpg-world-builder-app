import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AuthGuard } from '@/features/auth'
import { ROUTES } from '@/app/routes'
import {
  CampaignCreate,
  CampaignDetail,
  CampaignSessions,
  CampaignSettings,
} from '@/features/campaign'
import { ClassesOverview } from '@/features/content'
import { AppShell } from '@/components/layout/app-shell'
import { ConcentrationShell } from '@/components/layout/concentration-shell'
import { DashboardHome } from '@/routes/dashboard-home'
import { Characters } from '@/routes/characters'
import { Profile } from '@/routes/profile'
import { AccountSettings } from '@/routes/account'
import { AdminUsers } from '@/routes/admin/admin-users'
import { AdminSettings } from '@/routes/admin/admin-settings'

// Vite serves the app under `base: "/app/"`; React Router needs the matching
// basename (without the trailing slash) so route paths resolve under `/app`.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

export function AppRouter() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        {/* Everything past the guard requires an authenticated session. */}
        <Route element={<AuthGuard />}>
          <Route element={<AppShell />}>
            <Route index element={<DashboardHome />} />
            <Route path="characters" element={<Characters />} />
            <Route path="profile" element={<Profile />} />
            <Route path="account" element={<AccountSettings />} />
            <Route path="campaigns/:campaignId" element={<CampaignDetail />} />
            <Route path="campaigns/:campaignId/sessions" element={<CampaignSessions />} />
            <Route path="campaigns/:campaignId/settings" element={<CampaignSettings />} />
            <Route path="campaigns/:campaignId/classes" element={<ClassesOverview />} />
            <Route path="admin/users" element={<AdminUsers />} />
            <Route path="admin/settings" element={<AdminSettings />} />
          </Route>
          <Route element={<ConcentrationShell />}>
            <Route path="campaigns/new" element={<CampaignCreate />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
