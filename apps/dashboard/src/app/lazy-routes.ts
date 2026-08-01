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
export const ClassCreateRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/classes/routes/class-create'), 'ClassCreate'),
)
export const ClassEditRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/classes/routes/class-edit'), 'ClassEdit'),
)

export const SpeciesOverviewRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/species/routes/species-overview'), 'SpeciesOverview'),
)
export const SpeciesDetailRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/species/routes/species-detail'), 'SpeciesDetail'),
)
export const SpeciesCreateRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/species/routes/species-create'), 'SpeciesCreate'),
)
export const SpeciesEditRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/species/routes/species-edit'), 'SpeciesEdit'),
)

export const FeatsOverviewRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/feats/routes/feats-overview'), 'FeatsOverview'),
)
export const FeatDetailRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/feats/routes/feat-detail'), 'FeatDetail'),
)
export const FeatCreateRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/feats/routes/feat-create'), 'FeatCreate'),
)
export const FeatEditRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/feats/routes/feat-edit'), 'FeatEdit'),
)

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
  lazyNamed(
    () => import('@/features/content/organizations/routes/organization-create'),
    'OrganizationCreate',
  ),
)
export const OrganizationEditRoute = withRouteSuspense(
  lazyNamed(
    () => import('@/features/content/organizations/routes/organization-edit'),
    'OrganizationEdit',
  ),
)

export const SpellsOverviewRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/spells/routes/spells-overview'), 'SpellsOverview'),
)
export const SpellDetailRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/spells/routes/spells-detail'), 'SpellDetail'),
)
export const SpellCreateRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/spells/routes/spell-create'), 'SpellCreate'),
)
export const SpellEditRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/content/spells/routes/spell-edit'), 'SpellEdit'),
)

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
  lazyNamed<{ family: EquipmentFamilyPath }>(
    () => import('@/features/content/equipment/routes/equipment-family-create'),
    'EquipmentFamilyCreate',
  ),
)
export const EquipmentDetailRoute = withRouteSuspense(
  lazyNamed<{ family: EquipmentFamilyPath }>(
    () => import('@/features/content/equipment/routes/equipment-detail'),
    'EquipmentDetail',
  ),
)
export const EquipmentEditRoute = withRouteSuspense(
  lazyNamed<{ family: EquipmentFamilyPath }>(
    () => import('@/features/content/equipment/routes/equipment-edit'),
    'EquipmentEdit',
  ),
)

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
  lazyNamed(
    () => import('@/features/content/skill-proficiencies/routes/skill-proficiency-create'),
    'SkillProficiencyCreate',
  ),
)
export const SkillProficiencyEditRoute = withRouteSuspense(
  lazyNamed(
    () => import('@/features/content/skill-proficiencies/routes/skill-proficiency-edit'),
    'SkillProficiencyEdit',
  ),
)

export const HomebrewHubRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/homebrew/routes/homebrew-hub'), 'HomebrewHub'),
)
export const VocabularyHubRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/homebrew/routes/vocabulary-hub'), 'VocabularyHub'),
)
export const VocabularyOverviewRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/homebrew/routes/vocabulary-overview'), 'VocabularyOverview'),
)
export const VocabularyTermDetailRoute = withRouteSuspense(
  lazyNamed(
    () => import('@/features/homebrew/routes/vocabulary-term-detail'),
    'VocabularyTermDetail',
  ),
)
export const VocabularyLandingRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/homebrew/routes/vocabulary-landing'), 'VocabularyLanding'),
)
export const VocabularyDetailRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/homebrew/routes/vocabulary-detail'), 'VocabularyDetail'),
)
export const RulesConfigDetailRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/homebrew/routes/rules-config-detail'), 'RulesConfigDetail'),
)
