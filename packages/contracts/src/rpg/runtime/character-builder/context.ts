import type { z } from 'zod'

import type { SystemRulesetId } from '../../primitives/ruleset'
import type { ContentViewer } from '../../campaign/lib/campaign-content-viewer'
import type { CharacterClass } from '../../content/classes/class'
import type { Equipment } from '../../content/equipment'
import type { SkillProficiency } from '../../content/skill-proficiency'
import type { Species } from '../../content/species'
import type { Spell } from '../../content/spell'
import type { LanguageSeedOption } from '../../vocab/language'
import { resolvedCampaignCharacterCreationPatchSchema } from '../../campaign/patches/campaign-character-creation-patch'
import { resolvedArmorClassSchema } from '../../campaign/patches/campaign-mechanics-patch'
import { abilityGenerationRulesSchema } from './ability/ability-generation'
import type {
  CharacterAcquisitionChannel,
  CharacterAuthoringSurface,
  CharacterKind,
  CharacterOwnershipTarget,
  CharacterRulesScope,
} from '../character-acquisition'
import type {
  CharacterBuilderMode,
  CharacterBuildScope,
  CampaignCharacterBuildScope,
  StandaloneCharacterBuilderMode,
  StandaloneCharacterBuildScope,
} from './mode-scope'
import type { CharacterBuildAcquisition } from './acquisition'

// ---------------------------------------------------------------------------
// CharacterBuildContext — the normalized input the builder UI and resolvers
// consume. Consumers must not care whether rules came from standalone
// defaults or campaign patches; campaign scope later swaps the rules source
// and filters the catalog without touching this shape.
// ---------------------------------------------------------------------------

export type CharacterBuildLanguageOption = LanguageSeedOption

/**
 * Catalog lists as delivered by the API — arrays only at this boundary.
 * Resolvers and derive code look items up through
 * {@link indexCharacterBuildCatalog}, never by scanning these arrays.
 */
export type CharacterBuildCatalog = {
  species: Species[]
  classes: CharacterClass[]
  spells: Spell[]
  equipment: Equipment[]
  skillProficiencies: SkillProficiency[]
  /** Active language vocabulary rows for the ruleset (category included). */
  languages: CharacterBuildLanguageOption[]
}

export type CharacterBuildCatalogIndex = {
  species: ReadonlyMap<string, Species>
  classes: ReadonlyMap<string, CharacterClass>
  spells: ReadonlyMap<string, Spell>
  equipment: ReadonlyMap<string, Equipment>
  skillProficiencies: ReadonlyMap<string, SkillProficiency>
  languages: readonly CharacterBuildLanguageOption[]
}

function byId<T extends { id: string }>(items: readonly T[]): ReadonlyMap<string, T> {
  return new Map(items.map((item) => [item.id, item]))
}

/** Build once per catalog (memoize in the consuming hook), pass to resolvers/derive. */
export function indexCharacterBuildCatalog(
  catalog: CharacterBuildCatalog,
): CharacterBuildCatalogIndex {
  return {
    species: byId(catalog.species),
    classes: byId(catalog.classes),
    spells: byId(catalog.spells),
    equipment: byId(catalog.equipment),
    skillProficiencies: byId(catalog.skillProficiencies),
    languages: catalog.languages,
  }
}

/**
 * Character-creation rules the builder consumes: the resolved campaign patch
 * shape (standalone resolves it with no patch applied) plus ability
 * generation, which has no campaign patch surface yet.
 */
export const resolvedCharacterCreationRulesSchema =
  resolvedCampaignCharacterCreationPatchSchema.extend({
    abilityGeneration: abilityGenerationRulesSchema,
    armorClass: resolvedArmorClassSchema,
  })

export type ResolvedCharacterCreationRules = z.infer<typeof resolvedCharacterCreationRulesSchema>

export type CharacterBuilderPermissions = {
  canCreateCharacter: boolean
}

export type CharacterBuildContext = {
  channel: CharacterAcquisitionChannel
  surface: CharacterAuthoringSurface
  characterKind: CharacterKind
  /** @deprecated Prefer `surface` + `characterKind`. */
  mode: CharacterBuilderMode
  /** @deprecated Prefer `rulesScope` from acquisition types. */
  scope: CharacterBuildScope
  ownershipTarget: CharacterOwnershipTarget
  rulesScope: CharacterRulesScope
  rulesetId: SystemRulesetId
  catalog: CharacterBuildCatalog
  characterCreationRules: ResolvedCharacterCreationRules
  permissions: CharacterBuilderPermissions
  /**
   * Optional defense-in-depth catalog filter — mirrors API discovery policy when
   * the builder receives a pre-resolved viewer (e.g. campaign PC context).
   */
  catalogViewer?: ContentViewer
}

/** MVP instantiation — no campaign patch/membership context. */
export type StandaloneBuildContext = CharacterBuildContext & {
  mode: StandaloneCharacterBuilderMode
  scope: StandaloneCharacterBuildScope
  rulesScope: Extract<CharacterRulesScope, { type: 'ruleset' }>
  ownershipTarget: { type: 'user' }
  characterKind: 'pc'
}

/** Campaign-scoped NPC authoring — rules and catalog from campaign patch + content. */
export type CampaignNpcBuildContext = CharacterBuildContext & {
  mode: 'dashboard'
  scope: CampaignCharacterBuildScope
  rulesScope: Extract<CharacterRulesScope, { type: 'campaign' }>
  ownershipTarget: { type: 'campaign'; campaignId: string }
  characterKind: 'npc'
  acquisition: Extract<CharacterBuildAcquisition, { kind: 'campaign_npc' }>
}

/** Campaign-scoped PC authoring — owned by the inviting user, rules from campaign. */
export type CampaignPcBuildContext = CharacterBuildContext & {
  mode: 'dashboard'
  scope: CampaignCharacterBuildScope
  rulesScope: Extract<CharacterRulesScope, { type: 'campaign' }>
  ownershipTarget: { type: 'user'; userId: string }
  characterKind: 'pc'
  acquisition: Extract<CharacterBuildAcquisition, { kind: 'campaign_pc_onboarding' }>
}

/** Discriminated union — only legal campaign build combinations compile. */
export type CampaignBuildContext = CampaignNpcBuildContext | CampaignPcBuildContext

export function isCampaignBuildContext(
  context: CharacterBuildContext,
): context is CampaignBuildContext {
  return 'acquisition' in context
}

export function isCampaignPcOnboardingBuildContext(
  context: CharacterBuildContext,
): context is CampaignPcBuildContext & {
  acquisition: Extract<CharacterBuildAcquisition, { kind: 'campaign_pc_onboarding' }>
} {
  return isCampaignBuildContext(context) && context.acquisition.kind === 'campaign_pc_onboarding'
}

export function resolveCampaignIdFromContext(
  context: Pick<CharacterBuildContext, 'rulesScope'>,
): string | undefined {
  return context.rulesScope.type === 'campaign' ? context.rulesScope.campaignId : undefined
}
