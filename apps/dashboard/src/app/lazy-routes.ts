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
export const AccountSettingsRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/user/routes/account-settings'), 'AccountSettings'),
)
export const AdminUsersRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/admin/routes/admin-users'), 'AdminUsers'),
)
export const AdminSettingsRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/admin/routes/admin-settings'), 'AdminSettings'),
)

export const CampaignCreateRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/campaign/routes/campaign-create'), 'CampaignCreate'),
)
export const CampaignDetailRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/campaign/routes/campaign-detail'), 'CampaignDetail'),
)
export const CampaignSessionsRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/campaign/routes/campaign-sessions'), 'CampaignSessions'),
)
export const CampaignSettingsRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/campaign/routes/campaign-settings'), 'CampaignSettings'),
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
export const VocabularyDetailRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/homebrew/routes/vocabulary-detail'), 'VocabularyDetail'),
)
export const RulesConfigDetailRoute = withRouteSuspense(
  lazyNamed(() => import('@/features/homebrew/routes/rules-config-detail'), 'RulesConfigDetail'),
)
