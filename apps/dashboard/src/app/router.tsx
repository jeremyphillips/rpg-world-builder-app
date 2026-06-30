import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom'

import { AdminRouteGuard } from '@/features/admin'
import { AuthGuard } from '@/features/auth'
import { ROUTES } from '@/app/routes'
import type { CrumbHandle } from '@/app/breadcrumbs'
import {
  EQUIPMENT_FAMILY_PATHS,
  getEquipmentFamilyLabel,
} from '@/features/content/equipment/lib/shared/equipment-family-paths'
import {
  AccountSettingsRoute,
  AdminSettingsRoute,
  AdminUsersRoute,
  CampaignCreateRoute,
  CampaignDetailRoute,
  CampaignSessionsRoute,
  CampaignSettingsRoute,
  CharactersRoute,
  ClassCreateRoute,
  ClassDetailRoute,
  ClassEditRoute,
  ClassesOverviewRoute,
  EquipmentDetailRoute,
  EquipmentEditRoute,
  EquipmentFamilyCreateRoute,
  EquipmentFamilyOverviewRoute,
  EquipmentHubRoute,
  FeatCreateRoute,
  FeatDetailRoute,
  FeatEditRoute,
  FeatsOverviewRoute,
  SkillProficienciesOverviewRoute,
  SkillProficiencyCreateRoute,
  SkillProficiencyDetailRoute,
  SkillProficiencyEditRoute,
  HomebrewHubRoute,
  RulesConfigDetailRoute,
  VocabularyDetailRoute,
  SpeciesCreateRoute,
  SpeciesDetailRoute,
  SpeciesEditRoute,
  SpeciesOverviewRoute,
  SpellCreateRoute,
  SpellDetailRoute,
  SpellEditRoute,
  SpellsOverviewRoute,
} from '@/app/lazy-routes'
import { AppShell } from '@/components/layout/app-shell'
import { ConcentrationShell } from '@/components/layout/concentration-shell'
import { DashboardHome } from '@/routes/dashboard-home'

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
              element: <CharactersRoute />,
              handle: { crumb: () => ({ label: 'Characters' }) } satisfies CrumbHandle,
            },
            {
              path: 'account',
              element: <AccountSettingsRoute />,
              handle: { crumb: () => ({ label: 'Account Settings' }) } satisfies CrumbHandle,
            },
            {
              path: 'admin',
              element: <AdminRouteGuard />,
              children: [
                {
                  path: 'users',
                  element: <AdminUsersRoute />,
                  handle: { crumb: () => ({ label: 'Admin / Users' }) } satisfies CrumbHandle,
                },
                {
                  path: 'settings',
                  element: <AdminSettingsRoute />,
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
                { index: true, element: <CampaignDetailRoute /> },
                {
                  path: 'sessions',
                  element: <CampaignSessionsRoute />,
                  handle: { crumb: () => ({ label: 'Sessions' }) } satisfies CrumbHandle,
                },
                {
                  path: 'settings',
                  element: <CampaignSettingsRoute />,
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
                    { index: true, element: <ClassesOverviewRoute /> },
                    {
                      path: 'new',
                      element: <ClassCreateRoute />,
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
                        { index: true, element: <ClassDetailRoute /> },
                        {
                          path: 'edit',
                          element: <ClassEditRoute />,
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
                    { index: true, element: <SpeciesOverviewRoute /> },
                    {
                      path: 'new',
                      element: <SpeciesCreateRoute />,
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
                        { index: true, element: <SpeciesDetailRoute /> },
                        {
                          path: 'edit',
                          element: <SpeciesEditRoute />,
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
                    { index: true, element: <FeatsOverviewRoute /> },
                    {
                      path: 'new',
                      element: <FeatCreateRoute />,
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
                        { index: true, element: <FeatDetailRoute /> },
                        {
                          path: 'edit',
                          element: <FeatEditRoute />,
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
                    { index: true, element: <SpellsOverviewRoute /> },
                    {
                      path: 'new',
                      element: <SpellCreateRoute />,
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
                        { index: true, element: <SpellDetailRoute /> },
                        {
                          path: 'edit',
                          element: <SpellEditRoute />,
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
                    { index: true, element: <EquipmentHubRoute /> },
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
                        {
                          index: true,
                          element: <EquipmentFamilyOverviewRoute family={family} />,
                        },
                        {
                          path: 'new',
                          element: <EquipmentFamilyCreateRoute family={family} />,
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
                            {
                              index: true,
                              element: <EquipmentDetailRoute family={family} />,
                            },
                            {
                              path: 'edit',
                              element: <EquipmentEditRoute family={family} />,
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
                    { index: true, element: <SkillProficienciesOverviewRoute /> },
                    {
                      path: 'new',
                      element: <SkillProficiencyCreateRoute />,
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
                        { index: true, element: <SkillProficiencyDetailRoute /> },
                        {
                          path: 'edit',
                          element: <SkillProficiencyEditRoute />,
                          handle: { crumb: () => ({ label: 'Edit' }) } satisfies CrumbHandle,
                        },
                      ],
                    },
                  ],
                },
                {
                  path: 'homebrew',
                  element: <Outlet />,
                  handle: {
                    crumb: (params) => ({
                      label: 'Homebrew',
                      href: ROUTES.homebrew.hub(params.campaignId!),
                    }),
                  } satisfies CrumbHandle,
                  children: [
                    { index: true, element: <HomebrewHubRoute /> },
                    {
                      path: 'vocabulary/:setId',
                      element: <VocabularyDetailRoute />,
                      handle: {
                        crumb: (_params, { entityLabel }) => ({
                          label: entityLabel ?? 'Vocabulary',
                        }),
                      } satisfies CrumbHandle,
                    },
                    {
                      path: 'rules-config/:configId',
                      element: <RulesConfigDetailRoute />,
                      handle: {
                        crumb: (_params, { entityLabel }) => ({
                          label: entityLabel ?? 'Rules Configuration',
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
          children: [{ path: 'campaigns/new', element: <CampaignCreateRoute /> }],
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
