import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AuthGuard } from '@/features/auth'
import { CampaignDetail } from '@/features/campaign'
import { AppShell } from '@/components/layout/app-shell'
import { DashboardHome } from '@/routes/dashboard-home'

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
            <Route path="campaigns/:campaignId" element={<CampaignDetail />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
