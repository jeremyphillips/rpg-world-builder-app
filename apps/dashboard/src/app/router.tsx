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
import {
  ClassesOverview,
  ClassDetail,
  ClassCreate,
  ClassEdit,
  EquipmentHub,
  EquipmentFamilyOverview,
  EquipmentFamilyCreate,
  EquipmentDetail,
  EquipmentEdit,
  EQUIPMENT_FAMILY_PATHS,
  getEquipmentFamilyLabel,
  SkillProficienciesOverview,
  SkillProficiencyDetail,
  SkillProficiencyCreate,
  SkillProficiencyEdit,
  SpeciesOverview,
  SpeciesDetail,
  SpeciesCreate,
  SpeciesEdit,
  FeatsOverview,
  FeatDetail,
  FeatCreate,
  FeatEdit,
  SpellsOverview,
  SpellDetail,
  SpellCreate,
  SpellEdit,
} from '@/features/content'
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
                      path: 'new',
                      element: <ClassCreate />,
                      handle: { crumb: () => ({ label: 'New' }) } satisfies CrumbHandle,
                    },
                    {
                      path: ':classId',
                      element: <Outlet />,
                      handle: {
                        crumb: (_params, { entityLabel }) => ({
                          label: entityLabel ?? '…',
                        }),
                      } satisfies CrumbHandle,
                      children: [
                        { index: true, element: <ClassDetail /> },
                        {
                          path: 'edit',
                          element: <ClassEdit />,
                          handle: { crumb: () => ({ label: 'Edit' }) } satisfies CrumbHandle,
                        },
                      ],
                    },
                  ],
                },
                {
                  path: 'species',
                  element: <Outlet />,
                  handle: {
                    crumb: (params) => ({
                      label: 'Species',
                      href: ROUTES.content.species.overview(params.campaignId!),
                    }),
                  } satisfies CrumbHandle,
                  children: [
                    { index: true, element: <SpeciesOverview /> },
                    {
                      path: 'new',
                      element: <SpeciesCreate />,
                      handle: { crumb: () => ({ label: 'New' }) } satisfies CrumbHandle,
                    },
                    {
                      path: ':speciesId',
                      element: <Outlet />,
                      handle: {
                        crumb: (_params, { entityLabel }) => ({
                          label: entityLabel ?? '…',
                        }),
                      } satisfies CrumbHandle,
                      children: [
                        { index: true, element: <SpeciesDetail /> },
                        {
                          path: 'edit',
                          element: <SpeciesEdit />,
                          handle: { crumb: () => ({ label: 'Edit' }) } satisfies CrumbHandle,
                        },
                      ],
                    },
                  ],
                },
                {
                  path: 'feats',
                  element: <Outlet />,
                  handle: {
                    crumb: (params) => ({
                      label: 'Feats',
                      href: ROUTES.content.feats.overview(params.campaignId!),
                    }),
                  } satisfies CrumbHandle,
                  children: [
                    { index: true, element: <FeatsOverview /> },
                    {
                      path: 'new',
                      element: <FeatCreate />,
                      handle: { crumb: () => ({ label: 'New' }) } satisfies CrumbHandle,
                    },
                    {
                      path: ':featId',
                      element: <Outlet />,
                      handle: {
                        crumb: (_params, { entityLabel }) => ({
                          label: entityLabel ?? '…',
                        }),
                      } satisfies CrumbHandle,
                      children: [
                        { index: true, element: <FeatDetail /> },
                        {
                          path: 'edit',
                          element: <FeatEdit />,
                          handle: { crumb: () => ({ label: 'Edit' }) } satisfies CrumbHandle,
                        },
                      ],
                    },
                  ],
                },
                {
                  path: 'spells',
                  element: <Outlet />,
                  handle: {
                    crumb: (params) => ({
                      label: 'Spells',
                      href: ROUTES.content.spells.overview(params.campaignId!),
                    }),
                  } satisfies CrumbHandle,
                  children: [
                    { index: true, element: <SpellsOverview /> },
                    {
                      path: 'new',
                      element: <SpellCreate />,
                      handle: { crumb: () => ({ label: 'New' }) } satisfies CrumbHandle,
                    },
                    {
                      path: ':spellId',
                      element: <Outlet />,
                      handle: {
                        crumb: (_params, { entityLabel }) => ({
                          label: entityLabel ?? '…',
                        }),
                      } satisfies CrumbHandle,
                      children: [
                        { index: true, element: <SpellDetail /> },
                        {
                          path: 'edit',
                          element: <SpellEdit />,
                          handle: { crumb: () => ({ label: 'Edit' }) } satisfies CrumbHandle,
                        },
                      ],
                    },
                  ],
                },
                {
                  path: 'equipment',
                  element: <Outlet />,
                  handle: {
                    crumb: (params) => ({
                      label: 'Equipment',
                      href: ROUTES.content.equipment.hub(params.campaignId!),
                    }),
                  } satisfies CrumbHandle,
                  children: [
                    { index: true, element: <EquipmentHub /> },
                    ...EQUIPMENT_FAMILY_PATHS.map((family) => ({
                      path: family,
                      element: <Outlet />,
                      handle: {
                        crumb: (params) => ({
                          label: getEquipmentFamilyLabel(family),
                          href: ROUTES.content.equipment.family(params.campaignId!, family),
                        }),
                      } satisfies CrumbHandle,
                      children: [
                        { index: true, element: <EquipmentFamilyOverview family={family} /> },
                        {
                          path: 'new',
                          element: <EquipmentFamilyCreate family={family} />,
                          handle: { crumb: () => ({ label: 'New' }) } satisfies CrumbHandle,
                        },
                        {
                          path: ':equipmentId',
                          element: <Outlet />,
                          handle: {
                            crumb: (_params, { entityLabel }) => ({
                              label: entityLabel ?? '…',
                            }),
                          } satisfies CrumbHandle,
                          children: [
                            { index: true, element: <EquipmentDetail family={family} /> },
                            {
                              path: 'edit',
                              element: <EquipmentEdit family={family} />,
                              handle: { crumb: () => ({ label: 'Edit' }) } satisfies CrumbHandle,
                            },
                          ],
                        },
                      ],
                    })),
                  ],
                },
                {
                  path: 'skill-proficiencies',
                  element: <Outlet />,
                  handle: {
                    crumb: (params) => ({
                      label: 'Skill Proficiencies',
                      href: ROUTES.content.skillProficiencies.overview(params.campaignId!),
                    }),
                  } satisfies CrumbHandle,
                  children: [
                    { index: true, element: <SkillProficienciesOverview /> },
                    {
                      path: 'new',
                      element: <SkillProficiencyCreate />,
                      handle: { crumb: () => ({ label: 'New' }) } satisfies CrumbHandle,
                    },
                    {
                      path: ':skillId',
                      element: <Outlet />,
                      handle: {
                        crumb: (_params, { entityLabel }) => ({
                          label: entityLabel ?? '…',
                        }),
                      } satisfies CrumbHandle,
                      children: [
                        { index: true, element: <SkillProficiencyDetail /> },
                        {
                          path: 'edit',
                          element: <SkillProficiencyEdit />,
                          handle: { crumb: () => ({ label: 'Edit' }) } satisfies CrumbHandle,
                        },
                      ],
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
