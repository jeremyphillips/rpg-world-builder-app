import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom'

import { AuthGuard } from '@/features/auth'
import { ROUTES } from '@/app/routes'
import type { CrumbHandle } from '@/app/breadcrumbs'
import {
  CampaignCreate,
  CampaignDetail,
  CampaignSessions,
  CampaignSettings,
} from '@/features/campaign'
import { ClassesOverview, ClassDetail } from '@/features/content'
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

const router = createBrowserRouter(
  [
    {
      element: <AuthGuard />,
      children: [
        {
          element: <AppShell />,
          children: [
            { index: true, element: <DashboardHome /> },
            {
              path: 'characters',
              element: <Characters />,
              handle: { crumb: () => ({ label: 'Characters' }) } satisfies CrumbHandle,
            },
            {
              path: 'profile',
              element: <Profile />,
              handle: { crumb: () => ({ label: 'Profile' }) } satisfies CrumbHandle,
            },
            {
              path: 'account',
              element: <AccountSettings />,
              handle: { crumb: () => ({ label: 'Account Settings' }) } satisfies CrumbHandle,
            },
            {
              path: 'admin',
              element: <Outlet />,
              children: [
                {
                  path: 'users',
                  element: <AdminUsers />,
                  handle: { crumb: () => ({ label: 'Admin / Users' }) } satisfies CrumbHandle,
                },
                {
                  path: 'settings',
                  element: <AdminSettings />,
                  handle: {
                    crumb: () => ({ label: 'Admin / Settings' }),
                  } satisfies CrumbHandle,
                },
              ],
            },
            {
              path: 'campaigns/:campaignId',
              /**
               * Layout wrapper: provides the campaign-level breadcrumb crumb and
               * renders children via <Outlet />. The index child is CampaignDetail.
               */
              element: <Outlet />,
              handle: {
                crumb: (params, { campaignName }) => ({
                  label: campaignName ?? 'Campaign',
                  href: ROUTES.campaign.detail(params.campaignId!),
                }),
              } satisfies CrumbHandle,
              children: [
                { index: true, element: <CampaignDetail /> },
                {
                  path: 'sessions',
                  element: <CampaignSessions />,
                  handle: { crumb: () => ({ label: 'Sessions' }) } satisfies CrumbHandle,
                },
                {
                  path: 'settings',
                  element: <CampaignSettings />,
                  handle: { crumb: () => ({ label: 'Settings' }) } satisfies CrumbHandle,
                },
                {
                  path: 'classes',
                  element: <Outlet />,
                  handle: {
                    crumb: (params) => ({
                      label: 'Classes',
                      href: ROUTES.content.classes.overview(params.campaignId!),
                    }),
                  } satisfies CrumbHandle,
                  children: [
                    { index: true, element: <ClassesOverview /> },
                    {
                      path: ':classId',
                      element: <ClassDetail />,
                      handle: {
                        crumb: (_params, { entityLabel }) => ({
                          label: entityLabel ?? '…',
                        }),
                      } satisfies CrumbHandle,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          element: <ConcentrationShell />,
          children: [{ path: 'campaigns/new', element: <CampaignCreate /> }],
        },
      ],
    },
    { path: '*', element: <Navigate to={ROUTES.home} replace /> },
  ],
  { basename },
)

export function AppRouter() {
  return <RouterProvider router={router} />
}
