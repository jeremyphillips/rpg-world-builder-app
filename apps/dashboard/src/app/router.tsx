import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom'

import { AdminRouteGuard } from '@/features/admin'
import { AuthGuard } from '@/features/auth'
import { ROUTES } from '@/app/routes'
import type { BreadcrumbModeHandle, CrumbHandle } from '@/app/breadcrumbs'
import { collectionCrumbHref, entityDetailCrumbHref } from '@/app/breadcrumbs'
import {
  EQUIPMENT_FAMILY_PATHS,
  getEquipmentFamilyLabel,
} from '@/features/content/equipment/lib/shared/equipment-family-paths'
import { getContentTypeCollectionLabel } from '@/features/content/lib/content-type-labels'
import {
  AccountSettingsRoute,
  AdminSettingsRoute,
  AdminUserCampaignsRoute,
  AdminUserCharactersRoute,
  AdminUserDetailRoute,
  AdminUserLayoutRoute,
  AdminUsersRoute,
  CampaignCreateRoute,
  CampaignCharacterDetailRoute,
  CampaignCharactersOverviewRoute,
  CampaignDetailRoute,
  CampaignsOverviewRoute,
  CampaignLayoutRoute,
  CampaignOnboardingRoute,
  CampaignSessionsRoute,
  CampaignSettingsRoute,
  CharacterCreateRoute,
  CharacterDetailRoute,
  CharacterImportRoute,
  CharactersOverviewRoute,
  NpcCreateRoute,
  NpcDetailRoute,
  NpcImportRoute,
  NpcsOverviewRoute,
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
  OrganizationCreateRoute,
  OrganizationDetailRoute,
  OrganizationEditRoute,
  OrganizationsOverviewRoute,
  SkillProficienciesOverviewRoute,
  SkillProficiencyCreateRoute,
  SkillProficiencyDetailRoute,
  SkillProficiencyEditRoute,
  HomebrewHubRoute,
  MessagesWorkspaceRoute,
  NameGeneratorRoute,
  NotificationsListRoute,
  RulesConfigDetailRoute,
  VocabularyLandingRoute,
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
              element: <Outlet />,
              handle: {
                crumb: (_params, data) => ({
                  label: 'Characters',
                  href: collectionCrumbHref(ROUTES.characters.list, data),
                }),
              } satisfies CrumbHandle,
              children: [
                { index: true, element: <CharactersOverviewRoute /> },
                {
                  path: 'import',
                  element: <CharacterImportRoute />,
                  handle: { crumb: () => ({ label: 'Import' }) } satisfies CrumbHandle,
                },
                {
                  path: ':characterId',
                  element: <CharacterDetailRoute />,
                  handle: {
                    crumb: (_params, { entityLabel }) => ({
                      label: entityLabel ?? '…',
                    }),
                  } satisfies CrumbHandle,
                },
              ],
            },
            {
              path: 'account',
              element: <AccountSettingsRoute />,
              handle: { crumb: () => ({ label: 'Account Settings' }) } satisfies CrumbHandle,
            },
            {
              path: 'name-generator',
              element: <NameGeneratorRoute />,
              handle: { crumb: () => ({ label: 'Name Generator' }) } satisfies CrumbHandle,
            },
            {
              path: 'notifications',
              element: <NotificationsListRoute />,
              handle: { crumb: () => ({ label: 'Notifications' }) } satisfies CrumbHandle,
            },
            {
              path: 'messages',
              element: <MessagesWorkspaceRoute />,
              handle: {
                crumb: (_params, data) => ({
                  label: 'Messages',
                  href: collectionCrumbHref(ROUTES.messages.list, data),
                }),
              } satisfies CrumbHandle,
              children: [
                { index: true, element: null },
                {
                  path: 'new',
                  element: null,
                  handle: { crumb: () => ({ label: 'New message' }) } satisfies CrumbHandle,
                },
                {
                  path: ':conversationId',
                  element: null,
                  handle: {
                    crumb: (_params, { entityLabel }) => ({
                      label: entityLabel ?? 'Conversation',
                    }),
                  } satisfies CrumbHandle,
                },
              ],
            },
            {
              path: 'admin',
              element: <AdminRouteGuard />,
              children: [
                {
                  path: 'users',
                  element: <Outlet />,
                  handle: {
                    crumb: (_params, data) => ({
                      label: 'Admin / Users',
                      href: collectionCrumbHref(ROUTES.admin.users, data),
                    }),
                  } satisfies CrumbHandle,
                  children: [
                    {
                      index: true,
                      element: <AdminUsersRoute />,
                    },
                    {
                      path: ':userId',
                      element: <AdminUserLayoutRoute />,
                      handle: {
                        crumb: (_params, { entityLabel }) => ({
                          label: entityLabel ?? '…',
                        }),
                      } satisfies CrumbHandle,
                      children: [
                        { index: true, element: <AdminUserDetailRoute /> },
                        {
                          path: 'campaigns',
                          element: <AdminUserCampaignsRoute />,
                          handle: { crumb: () => ({ label: 'Campaigns' }) } satisfies CrumbHandle,
                        },
                        {
                          path: 'characters',
                          element: <AdminUserCharactersRoute />,
                          handle: { crumb: () => ({ label: 'Characters' }) } satisfies CrumbHandle,
                        },
                      ],
                    },
                  ],
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
              path: 'campaigns',
              handle: {
                crumb: (_params, data) => ({
                  label: 'Campaigns',
                  href: collectionCrumbHref(ROUTES.campaign.list, data),
                }),
              } satisfies CrumbHandle,
              children: [{ index: true, element: <CampaignsOverviewRoute /> }],
            },
            {
              path: 'campaigns/:campaignId',
              element: <CampaignLayoutRoute />,
              children: [
                { index: true, element: <CampaignDetailRoute /> },
                {
                  path: 'onboarding',
                  element: <CampaignOnboardingRoute />,
                  handle: { crumb: () => ({ label: 'Onboarding' }) } satisfies CrumbHandle,
                },
                {
                  path: 'characters',
                  element: <Outlet />,
                  handle: {
                    crumb: (params, data) => ({
                      label: 'Characters',
                      href: collectionCrumbHref(
                        ROUTES.campaign.characters.list(params.campaignId!),
                        data,
                      ),
                    }),
                  } satisfies CrumbHandle,
                  children: [
                    { index: true, element: <CampaignCharactersOverviewRoute /> },
                    {
                      path: ':characterId',
                      element: <CampaignCharacterDetailRoute />,
                      handle: {
                        crumb: (_params, { entityLabel }) => ({
                          label: entityLabel ?? 'Character',
                        }),
                      } satisfies CrumbHandle,
                    },
                  ],
                },
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
                  path: 'npcs',
                  element: <Outlet />,
                  handle: {
                    crumb: (params, data) => ({
                      label: 'NPCs',
                      href: collectionCrumbHref(
                        ROUTES.campaign.npcs.list(params.campaignId!),
                        data,
                      ),
                    }),
                  } satisfies CrumbHandle,
                  children: [
                    { index: true, element: <NpcsOverviewRoute /> },
                    {
                      path: 'new',
                      element: <NpcCreateRoute />,
                    },
                    {
                      path: 'import',
                      element: <NpcImportRoute />,
                      handle: { crumb: () => ({ label: 'Import' }) } satisfies CrumbHandle,
                    },
                    {
                      path: ':npcId',
                      element: <NpcDetailRoute />,
                      handle: {
                        crumb: (_params, { entityLabel }) => ({
                          label: entityLabel ?? '…',
                        }),
                      } satisfies CrumbHandle,
                    },
                  ],
                },
                {
                  path: 'classes',
                  element: <Outlet />,
                  handle: {
                    crumb: (params, data) => ({
                      label: getContentTypeCollectionLabel('classes'),
                      href: collectionCrumbHref(
                        ROUTES.content.classes.overview(params.campaignId!),
                        data,
                      ),
                    }),
                  } satisfies CrumbHandle,
                  children: [
                    { index: true, element: <ClassesOverviewRoute /> },
                    {
                      path: 'new',
                      element: <ClassCreateRoute />,
                    },
                    {
                      path: ':classId',
                      element: <Outlet />,
                      handle: {
                        crumb: (params, data) => ({
                          label: data.entityLabel ?? '…',
                          href: entityDetailCrumbHref(
                            ROUTES.content.classes.detail(params.campaignId!, params.classId!),
                            data,
                          ),
                        }),
                      } satisfies CrumbHandle,
                      children: [
                        { index: true, element: <ClassDetailRoute /> },
                        {
                          path: 'edit',
                          element: <ClassEditRoute />,
                          handle: { breadcrumbMode: 'edit' } satisfies BreadcrumbModeHandle,
                        },
                      ],
                    },
                  ],
                },
                {
                  path: 'species',
                  element: <Outlet />,
                  handle: {
                    crumb: (params, data) => ({
                      label: getContentTypeCollectionLabel('species'),
                      href: collectionCrumbHref(
                        ROUTES.content.species.overview(params.campaignId!),
                        data,
                      ),
                    }),
                  } satisfies CrumbHandle,
                  children: [
                    { index: true, element: <SpeciesOverviewRoute /> },
                    {
                      path: 'new',
                      element: <SpeciesCreateRoute />,
                    },
                    {
                      path: ':speciesId',
                      element: <Outlet />,
                      handle: {
                        crumb: (params, data) => ({
                          label: data.entityLabel ?? '…',
                          href: entityDetailCrumbHref(
                            ROUTES.content.species.detail(params.campaignId!, params.speciesId!),
                            data,
                          ),
                        }),
                      } satisfies CrumbHandle,
                      children: [
                        { index: true, element: <SpeciesDetailRoute /> },
                        {
                          path: 'edit',
                          element: <SpeciesEditRoute />,
                          handle: { breadcrumbMode: 'edit' } satisfies BreadcrumbModeHandle,
                        },
                      ],
                    },
                  ],
                },
                {
                  path: 'feats',
                  element: <Outlet />,
                  handle: {
                    crumb: (params, data) => ({
                      label: getContentTypeCollectionLabel('feats'),
                      href: collectionCrumbHref(
                        ROUTES.content.feats.overview(params.campaignId!),
                        data,
                      ),
                    }),
                  } satisfies CrumbHandle,
                  children: [
                    { index: true, element: <FeatsOverviewRoute /> },
                    {
                      path: 'new',
                      element: <FeatCreateRoute />,
                    },
                    {
                      path: ':featId',
                      element: <Outlet />,
                      handle: {
                        crumb: (params, data) => ({
                          label: data.entityLabel ?? '…',
                          href: entityDetailCrumbHref(
                            ROUTES.content.feats.detail(params.campaignId!, params.featId!),
                            data,
                          ),
                        }),
                      } satisfies CrumbHandle,
                      children: [
                        { index: true, element: <FeatDetailRoute /> },
                        {
                          path: 'edit',
                          element: <FeatEditRoute />,
                          handle: { breadcrumbMode: 'edit' } satisfies BreadcrumbModeHandle,
                        },
                      ],
                    },
                  ],
                },
                {
                  path: 'spells',
                  element: <Outlet />,
                  handle: {
                    crumb: (params, data) => ({
                      label: getContentTypeCollectionLabel('spells'),
                      href: collectionCrumbHref(
                        ROUTES.content.spells.overview(params.campaignId!),
                        data,
                      ),
                    }),
                  } satisfies CrumbHandle,
                  children: [
                    { index: true, element: <SpellsOverviewRoute /> },
                    {
                      path: 'new',
                      element: <SpellCreateRoute />,
                    },
                    {
                      path: ':spellId',
                      element: <Outlet />,
                      handle: {
                        crumb: (params, data) => ({
                          label: data.entityLabel ?? '…',
                          href: entityDetailCrumbHref(
                            ROUTES.content.spells.detail(params.campaignId!, params.spellId!),
                            data,
                          ),
                        }),
                      } satisfies CrumbHandle,
                      children: [
                        { index: true, element: <SpellDetailRoute /> },
                        {
                          path: 'edit',
                          element: <SpellEditRoute />,
                          handle: { breadcrumbMode: 'edit' } satisfies BreadcrumbModeHandle,
                        },
                      ],
                    },
                  ],
                },
                {
                  path: 'organizations',
                  element: <Outlet />,
                  handle: {
                    crumb: (params, data) => ({
                      label: getContentTypeCollectionLabel('organizations'),
                      href: collectionCrumbHref(
                        ROUTES.content.organizations.overview(params.campaignId!),
                        data,
                      ),
                    }),
                  } satisfies CrumbHandle,
                  children: [
                    { index: true, element: <OrganizationsOverviewRoute /> },
                    {
                      path: 'new',
                      element: <OrganizationCreateRoute />,
                    },
                    {
                      path: ':organizationId',
                      element: <Outlet />,
                      handle: {
                        crumb: (params, data) => ({
                          label: data.entityLabel ?? '…',
                          href: entityDetailCrumbHref(
                            ROUTES.content.organizations.detail(
                              params.campaignId!,
                              params.organizationId!,
                            ),
                            data,
                          ),
                        }),
                      } satisfies CrumbHandle,
                      children: [
                        { index: true, element: <OrganizationDetailRoute /> },
                        {
                          path: 'edit',
                          element: <OrganizationEditRoute />,
                          handle: { breadcrumbMode: 'edit' } satisfies BreadcrumbModeHandle,
                        },
                      ],
                    },
                  ],
                },
                {
                  path: 'equipment',
                  element: <Outlet />,
                  handle: {
                    crumb: (params, data) => ({
                      label: getContentTypeCollectionLabel('equipment'),
                      href: collectionCrumbHref(
                        ROUTES.content.equipment.hub(params.campaignId!),
                        data,
                      ),
                    }),
                  } satisfies CrumbHandle,
                  children: [
                    { index: true, element: <EquipmentHubRoute /> },
                    ...EQUIPMENT_FAMILY_PATHS.map((family) => ({
                      path: family,
                      element: <Outlet />,
                      handle: {
                        crumb: (params, data) => ({
                          label: getEquipmentFamilyLabel(family),
                          href: collectionCrumbHref(
                            ROUTES.content.equipment.family(params.campaignId!, family),
                            data,
                          ),
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
                        },
                        {
                          path: ':equipmentId',
                          element: <Outlet />,
                          handle: {
                            crumb: (params, data) => ({
                              label: data.entityLabel ?? '…',
                              href: entityDetailCrumbHref(
                                ROUTES.content.equipment.detail(
                                  params.campaignId!,
                                  family,
                                  params.equipmentId!,
                                ),
                                data,
                              ),
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
                              handle: { breadcrumbMode: 'edit' } satisfies BreadcrumbModeHandle,
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
                    crumb: (params, data) => ({
                      label: getContentTypeCollectionLabel('skill-proficiencies'),
                      href: collectionCrumbHref(
                        ROUTES.content.skillProficiencies.overview(params.campaignId!),
                        data,
                      ),
                    }),
                  } satisfies CrumbHandle,
                  children: [
                    { index: true, element: <SkillProficienciesOverviewRoute /> },
                    {
                      path: 'new',
                      element: <SkillProficiencyCreateRoute />,
                    },
                    {
                      path: ':skillId',
                      element: <Outlet />,
                      handle: {
                        crumb: (params, data) => ({
                          label: data.entityLabel ?? '…',
                          href: entityDetailCrumbHref(
                            ROUTES.content.skillProficiencies.detail(
                              params.campaignId!,
                              params.skillId!,
                            ),
                            data,
                          ),
                        }),
                      } satisfies CrumbHandle,
                      children: [
                        { index: true, element: <SkillProficiencyDetailRoute /> },
                        {
                          path: 'edit',
                          element: <SkillProficiencyEditRoute />,
                          handle: { breadcrumbMode: 'edit' } satisfies BreadcrumbModeHandle,
                        },
                      ],
                    },
                  ],
                },
                {
                  path: 'homebrew',
                  element: <Outlet />,
                  handle: {
                    crumb: (params, data) => ({
                      label: 'Homebrew',
                      href: collectionCrumbHref(ROUTES.homebrew.hub(params.campaignId!), data),
                    }),
                  } satisfies CrumbHandle,
                  children: [
                    { index: true, element: <HomebrewHubRoute /> },
                    {
                      path: 'vocabulary',
                      element: <Outlet />,
                      handle: {
                        crumb: (params, data) => ({
                          label: 'Vocabulary',
                          href: collectionCrumbHref(
                            ROUTES.homebrew.vocabularyHub(params.campaignId!),
                            data,
                          ),
                        }),
                      } satisfies CrumbHandle,
                      children: [
                        { index: true, element: <VocabularyLandingRoute /> },
                        {
                          path: ':setId',
                          element: <VocabularyDetailRoute />,
                          handle: {
                            crumb: (_params, { entityLabel }) => ({
                              label: entityLabel ?? '…',
                            }),
                          } satisfies CrumbHandle,
                        },
                      ],
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
        { path: 'characters/new', element: <CharacterCreateRoute /> },
      ],
    },
    { path: '*', element: <Navigate to={ROUTES.home} replace /> },
  ],
  { basename },
)

export function AppRouter() {
  return <RouterProvider router={router} />
}
