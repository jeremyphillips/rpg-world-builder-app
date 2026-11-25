import type { ContentTypeKey } from '@rpg/contracts'
import { lazy, type ComponentType } from 'react'

import type { EquipmentFamilyPath } from '@/features/content/equipment/lib/shared/equipment-family-paths'

import { withRouteSuspense } from './with-route-suspense'

function lazyNamed<P = Record<string, never>>(
  importFn: () => Promise<Record<string, unknown>>,
  exportName: string,
) {
  return lazy(() =>
    importFn().then((module) => ({
      default: module[exportName] as ComponentType<P>,
    })),
  )
}

type ContentFormLoaderProps<K extends ContentTypeKey> = K extends 'equipment'
  ? { family: EquipmentFamilyPath }
  : Record<string, never>

type ContentFormRouteLoaders = {
  [K in ContentTypeKey]: Record<
    'create' | 'edit',
    () => Promise<{
      default: ComponentType<ContentFormLoaderProps<K>>
    }>
  >
}

function loadContentFormRoute<Module extends object, Export extends keyof Module>(
  importRoute: () => Promise<Module>,
  component: Export,
) {
  return async () => {
    const module = await importRoute()
    const route = Object.hasOwn(module, component) ? module[component] : undefined
    if (typeof route !== 'function') {
      throw new Error(`Content form route export "${String(component)}" must be a component.`)
    }
    return { default: route }
  }
}

export const contentFormRouteLoaders = {
  classes: {
    create: loadContentFormRoute(
      () => import('@/features/content/classes/routes/class-create'),
      'ClassCreate',
    ),
    edit: loadContentFormRoute(
      () => import('@/features/content/classes/routes/class-edit'),
      'ClassEdit',
    ),
  },
  species: {
    create: loadContentFormRoute(
      () => import('@/features/content/species/routes/species-create'),
      'SpeciesCreate',
    ),
    edit: loadContentFormRoute(
      () => import('@/features/content/species/routes/species-edit'),
      'SpeciesEdit',
    ),
  },
  monsters: {
    create: loadContentFormRoute(
      () => import('@/features/content/monsters/routes/monster-create'),
      'MonsterCreate',
    ),
    edit: loadContentFormRoute(
      () => import('@/features/content/monsters/routes/monster-edit'),
      'MonsterEdit',
    ),
  },
  feats: {
    create: loadContentFormRoute(
      () => import('@/features/content/feats/routes/feat-create'),
      'FeatCreate',
    ),
    edit: loadContentFormRoute(
      () => import('@/features/content/feats/routes/feat-edit'),
      'FeatEdit',
    ),
  },
  organizations: {
    create: loadContentFormRoute(
      () => import('@/features/content/organizations/routes/organization-create'),
      'OrganizationCreate',
    ),
    edit: loadContentFormRoute(
      () => import('@/features/content/organizations/routes/organization-edit'),
      'OrganizationEdit',
    ),
  },
  locations: {
    create: loadContentFormRoute(
      () => import('@/features/content/locations/routes/location-create'),
      'LocationCreate',
    ),
    edit: loadContentFormRoute(
      () => import('@/features/content/locations/routes/location-edit'),
      'LocationEdit',
    ),
  },
  spells: {
    create: loadContentFormRoute(
      () => import('@/features/content/spells/routes/spell-create'),
      'SpellCreate',
    ),
    edit: loadContentFormRoute(
      () => import('@/features/content/spells/routes/spell-edit'),
      'SpellEdit',
    ),
  },
  equipment: {
    create: loadContentFormRoute(
      () => import('@/features/content/equipment/routes/equipment-family-create'),
      'EquipmentFamilyCreate',
    ),
    edit: loadContentFormRoute(
      () => import('@/features/content/equipment/routes/equipment-edit'),
      'EquipmentEdit',
    ),
  },
  'skill-proficiencies': {
    create: loadContentFormRoute(
      () => import('@/features/content/skill-proficiencies/routes/skill-proficiency-create'),
      'SkillProficiencyCreate',
    ),
    edit: loadContentFormRoute(
      () => import('@/features/content/skill-proficiencies/routes/skill-proficiency-edit'),
      'SkillProficiencyEdit',
    ),
  },
} satisfies ContentFormRouteLoaders

export const CharactersOverviewRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/character/routes/characters-overview'), 'CharactersOverview'),
)
export const CharacterDetailRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/character/routes/character-detail'), 'CharacterDetail'),
)
export const CharacterCreateRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/character/routes/character-create'), 'CharacterCreate'),
)
export const CharacterImportRoute = withRouteSuspense(
  lazyNamed(
    () => import('@/features/character-import/routes/character-import-route'),
    'CharacterImportRoute',
  ),
)
export const AccountSettingsRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/user/routes/account-settings'), 'AccountSettings'),
)
export const NameGeneratorRoute = withRouteSuspense(
  lazyNamed(
    () => import('@/features/name-generator/routes/name-generator-route'),
    'NameGeneratorRoute',
  ),
)
export const NotificationsListRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/notification/routes/notifications-list'), 'NotificationsList'),
)
export const CampaignInviteReviewRoute = withRouteSuspense(
  lazyNamed(
    () => import('@/features/campaign-invite/routes/campaign-invite-review'),
    'CampaignInviteReviewRoute',
  ),
)
export const MessagesWorkspaceRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/message/routes/messages-workspace'), 'MessagesWorkspace'),
)
export const AdminUsersRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/admin/routes/admin-users'), 'AdminUsers'),
)
export const AdminUserLayoutRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/admin/routes/admin-user-layout'), 'AdminUserLayout'),
)
export const AdminUserDetailRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/admin/routes/admin-user-detail'), 'AdminUserDetail'),
)
export const AdminUserCampaignsRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/admin/routes/admin-user-campaigns'), 'AdminUserCampaignsPage'),
)
export const AdminUserCharactersRoute = withRouteSuspense(
  lazyNamed(
    () => import('@/features/admin/routes/admin-user-characters'),
    'AdminUserCharactersPage',
  ),
)
export const AdminSettingsRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/admin/routes/admin-settings'), 'AdminSettings'),
)

export const CampaignCreateRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/campaign/routes/campaign-create'), 'CampaignCreate'),
)
export const CampaignsOverviewRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/campaign/routes/campaigns-overview'), 'CampaignsOverview'),
)
export const CampaignDetailRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/campaign/routes/campaign-detail'), 'CampaignDetail'),
)
export const CampaignOnboardingRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/campaign/routes/campaign-onboarding'), 'CampaignOnboarding'),
)
export const CampaignLayoutRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/campaign/routes/campaign-layout'), 'CampaignLayout'),
)
export const CampaignCharacterDetailRoute = withRouteSuspense(
  lazyNamed(
    () => import('@/features/campaign/routes/campaign-character-detail'),
    'CampaignCharacterDetail',
  ),
)
export const CampaignCharactersOverviewRoute = withRouteSuspense(
  lazyNamed(
    () => import('@/features/campaign/routes/campaign-characters-overview'),
    'CampaignCharactersOverview',
  ),
)
export const CampaignSessionsRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/campaign/routes/campaign-sessions'), 'CampaignSessions'),
)
export const CampaignSettingsRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/campaign/routes/campaign-settings'), 'CampaignSettings'),
)

export const NpcsOverviewRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/character/npc/routes/npcs-overview'), 'NpcsOverview'),
)
export const NpcCreateRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/character/npc/routes/npc-create'), 'NpcCreate'),
)
export const NpcImportRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/character/npc/routes/npc-import'), 'NpcImport'),
)
export const NpcDetailRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/character/npc/routes/npc-detail'), 'NpcDetail'),
)

export const ClassesOverviewRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/classes/routes/classes-overview'), 'ClassesOverview'),
)
export const ClassDetailRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/classes/routes/class-detail'), 'ClassDetail'),
)
export const ClassCreateRoute = withRouteSuspense(lazy(contentFormRouteLoaders['classes'].create))
export const ClassEditRoute = withRouteSuspense(lazy(contentFormRouteLoaders['classes'].edit))

export const SpeciesOverviewRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/species/routes/species-overview'), 'SpeciesOverview'),
)
export const SpeciesDetailRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/species/routes/species-detail'), 'SpeciesDetail'),
)
export const SpeciesCreateRoute = withRouteSuspense(lazy(contentFormRouteLoaders['species'].create))
export const SpeciesEditRoute = withRouteSuspense(lazy(contentFormRouteLoaders['species'].edit))

export const MonstersOverviewRoute = withRouteSuspense(
  lazyNamed(
    () => import('@/features/content/monsters/routes/monsters-overview'),
    'MonstersOverview',
  ),
)
export const MonsterDetailRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/monsters/routes/monster-detail'), 'MonsterDetail'),
)
export const MonsterCreateRoute = withRouteSuspense(
  lazy(contentFormRouteLoaders['monsters'].create),
)
export const MonsterEditRoute = withRouteSuspense(lazy(contentFormRouteLoaders['monsters'].edit))

export const FeatsOverviewRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/feats/routes/feats-overview'), 'FeatsOverview'),
)
export const FeatDetailRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/feats/routes/feat-detail'), 'FeatDetail'),
)
export const FeatCreateRoute = withRouteSuspense(lazy(contentFormRouteLoaders['feats'].create))
export const FeatEditRoute = withRouteSuspense(lazy(contentFormRouteLoaders['feats'].edit))

export const OrganizationsOverviewRoute = withRouteSuspense(
  lazyNamed(
    () => import('@/features/content/organizations/routes/organizations-overview'),
    'OrganizationsOverview',
  ),
)
export const OrganizationDetailRoute = withRouteSuspense(
  lazyNamed(
    () => import('@/features/content/organizations/routes/organization-detail'),
    'OrganizationDetail',
  ),
)
export const OrganizationCreateRoute = withRouteSuspense(
  lazy(contentFormRouteLoaders['organizations'].create),
)
export const OrganizationEditRoute = withRouteSuspense(
  lazy(contentFormRouteLoaders['organizations'].edit),
)

export const LocationsOverviewRoute = withRouteSuspense(
  lazyNamed(
    () => import('@/features/content/locations/routes/locations-overview'),
    'LocationsOverview',
  ),
)
export const LocationDetailRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/locations/routes/location-detail'), 'LocationDetail'),
)
export const LocationCreateRoute = withRouteSuspense(
  lazy(contentFormRouteLoaders['locations'].create),
)
export const LocationEditRoute = withRouteSuspense(lazy(contentFormRouteLoaders['locations'].edit))

export const SpellsOverviewRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/spells/routes/spells-overview'), 'SpellsOverview'),
)
export const SpellDetailRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/spells/routes/spells-detail'), 'SpellDetail'),
)
export const SpellCreateRoute = withRouteSuspense(lazy(contentFormRouteLoaders['spells'].create))
export const SpellEditRoute = withRouteSuspense(lazy(contentFormRouteLoaders['spells'].edit))

export const EquipmentHubRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/equipment/routes/equipment-hub'), 'EquipmentHub'),
)
export const EquipmentFamilyOverviewRoute = withRouteSuspense(
  lazyNamed<{ family: EquipmentFamilyPath }>(
    () => import('@/features/content/equipment/routes/equipment-family-overview'),
    'EquipmentFamilyOverview',
  ),
)
export const EquipmentFamilyCreateRoute = withRouteSuspense(
  lazy(contentFormRouteLoaders['equipment'].create),
)
export const EquipmentDetailRoute = withRouteSuspense(
  lazyNamed<{ family: EquipmentFamilyPath }>(
    () => import('@/features/content/equipment/routes/equipment-detail'),
    'EquipmentDetail',
  ),
)
export const EquipmentEditRoute = withRouteSuspense(lazy(contentFormRouteLoaders['equipment'].edit))

export const SkillProficienciesOverviewRoute = withRouteSuspense(
  lazyNamed(
    () => import('@/features/content/skill-proficiencies/routes/skill-proficiencies-overview'),
    'SkillProficienciesOverview',
  ),
)
export const SkillProficiencyDetailRoute = withRouteSuspense(
  lazyNamed(
    () => import('@/features/content/skill-proficiencies/routes/skill-proficiency-detail'),
    'SkillProficiencyDetail',
  ),
)
export const SkillProficiencyCreateRoute = withRouteSuspense(
  lazy(contentFormRouteLoaders['skill-proficiencies'].create),
)
export const SkillProficiencyEditRoute = withRouteSuspense(
  lazy(contentFormRouteLoaders['skill-proficiencies'].edit),
)

export const HomebrewHubRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/homebrew/routes/homebrew-hub'), 'HomebrewHub'),
)
export const VocabularyHubRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/game-terms/routes/vocabulary-hub'), 'VocabularyHub'),
)
export const VocabularyOverviewRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/game-terms/routes/vocabulary-overview'), 'VocabularyOverview'),
)
export const VocabularyTermDetailRoute = withRouteSuspense(
  lazyNamed(
    () => import('@/features/game-terms/routes/vocabulary-term-detail'),
    'VocabularyTermDetail',
  ),
)
export const VocabularyLandingRoute = withRouteSuspense(
  lazyNamed(() => import('@/app/legacy-vocabulary-redirects'), 'VocabularyLanding'),
)
export const VocabularyDetailRoute = withRouteSuspense(
  lazyNamed(() => import('@/app/legacy-vocabulary-detail-redirect'), 'VocabularyDetail'),
)
export const RulesConfigDetailRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/homebrew/routes/rules-config-detail'), 'RulesConfigDetail'),
)
export const GlobalSearchPageRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/global-search/routes/global-search-page'), 'GlobalSearchPage'),
)
