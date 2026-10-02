import {
  assembleCharacterProficiencies,
  assembleClassSpellcasting,
  assembleGrantedSpells,
  assembleStartingEquipment,
  characterWealthFromGrant,
  EMPTY_CHARACTER_EQUIPMENT,
  getCharacterBuilderTotalLevel,
  mergeCharacterSpellEntries,
  resolveUnresolvedChoiceSetSummaries,
  type CharacterBuildCatalogIndex,
  type CharacterBuilderDraft,
  type CharacterBuildContext,
  type ChoiceSet,
  type XpProgressionBody,
} from '@rpg/contracts'

import {
  formatBuilderDraftCharacterSummary,
  PREVIEW_UNNAMED_CHARACTER,
} from '../builder-preview/preview-identity-summary'
import { buildCharacterDetailViewModel } from './character-detail-view-model.lib'
import type {
  CharacterDetailProjectionCompleteness,
  CharacterDetailSource,
} from './character-detail-source.lib'

const DETAIL_PREVIEW_PLACEHOLDER_ID = 'character-detail-preview'

export type ProjectCharacterDraftDetailSourceInput = {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
  resolvedChoiceSets: readonly ChoiceSet[]
  xpProgression: Pick<XpProgressionBody, 'entries'>
}

function resolveDraftEquipment(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  context: CharacterBuildContext,
) {
  const rules = context.characterCreationRules
  const isLevelZeroNpc = draft.class.level === 0 && rules.levelZeroNpcs.enabled

  const emptyWealth = characterWealthFromGrant(undefined)

  if (isLevelZeroNpc) {
    return {
      equipment: EMPTY_CHARACTER_EQUIPMENT,
      wealth: emptyWealth,
    }
  }

  if (!draft.class.classId && draft.class.level > 0) {
    return {
      equipment: EMPTY_CHARACTER_EQUIPMENT,
      wealth: emptyWealth,
    }
  }

  return assembleStartingEquipment(draft, catalogIndex, {
    startingWealth: rules.startingWealth,
    rulesetId: context.rulesetId,
  })
}

function resolveDraftSpells(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  catalogIndex: CharacterBuildCatalogIndex,
  choiceSets: readonly ChoiceSet[],
) {
  const classId = draft.class.classId
  const characterClass = classId ? catalogIndex.classes.get(classId) : undefined
  const isLevelZeroNpc =
    draft.class.level === 0 && context.characterCreationRules.levelZeroNpcs.enabled

  if (!characterClass || isLevelZeroNpc) {
    return []
  }

  return mergeCharacterSpellEntries(
    assembleClassSpellcasting(draft, context, choiceSets),
    assembleGrantedSpells(draft, catalogIndex, characterClass),
  )
}

function resolveDraftDetailProficiencies(
  draft: CharacterBuilderDraft,
  args: ProjectCharacterDraftDetailSourceInput,
  characterClass: ReturnType<CharacterBuildCatalogIndex['classes']['get']>,
): CharacterDetailSource['proficiencies'] {
  const { catalogIndex, context, resolvedChoiceSets } = args
  const rules = context.characterCreationRules

  if (!characterClass && !draft.species.speciesId) {
    return { skills: [], weapons: [], armor: [], tools: [], languages: [] }
  }

  return assembleCharacterProficiencies(draft, catalogIndex, resolvedChoiceSets, characterClass, {
    rulesetId: context.rulesetId,
    characterCreationRules: rules,
  })
}

function resolveDraftDetailClassEntries(
  draft: CharacterBuilderDraft,
): CharacterDetailSource['classes'] {
  const classId = draft.class.classId
  if (classId) return [{ classId, level: draft.class.level }]
  if (draft.class.level > 0) return [{ level: draft.class.level }]
  return []
}

function resolveDraftDetailSpecies(
  draft: CharacterBuilderDraft,
): CharacterDetailSource['species'] | undefined {
  const speciesId = draft.species.speciesId
  if (!speciesId) return undefined

  return {
    id: speciesId,
    ...(draft.species.heritageId ? { heritageId: draft.species.heritageId } : {}),
  }
}

function buildDetailSourceFromDraft(
  draft: CharacterBuilderDraft,
  args: ProjectCharacterDraftDetailSourceInput,
): CharacterDetailSource {
  const { catalogIndex, context, resolvedChoiceSets } = args
  const classId = draft.class.classId
  const characterClass = classId ? catalogIndex.classes.get(classId) : undefined
  const { equipment, wealth } = resolveDraftEquipment(draft, catalogIndex, context)
  const species = resolveDraftDetailSpecies(draft)

  return {
    id: DETAIL_PREVIEW_PLACEHOLDER_ID,
    name: draft.identity.name?.trim() || PREVIEW_UNNAMED_CHARACTER,
    identitySummary: formatBuilderDraftCharacterSummary(draft, catalogIndex),
    ...(draft.identity.gender ? { gender: draft.identity.gender } : {}),
    ...(species ? { species } : {}),
    classes: resolveDraftDetailClassEntries(draft),
    ...(draft.abilities.scores ? { abilityScores: draft.abilities.scores } : {}),
    proficiencies: resolveDraftDetailProficiencies(draft, args, characterClass),
    spells: resolveDraftSpells(draft, context, catalogIndex, resolvedChoiceSets),
    equipment,
    wealth,
    feats: [],
    ...(draft.identity.narrative ? { narrative: draft.identity.narrative } : {}),
    ...(draft.identity.alignment ? { alignment: draft.identity.alignment } : {}),
  }
}

function assessDraftDetailCompleteness(
  draft: CharacterBuilderDraft,
  choiceSets: readonly ChoiceSet[],
): CharacterDetailProjectionCompleteness {
  const unresolved = resolveUnresolvedChoiceSetSummaries(draft, choiceSets)
  const hasAbilityScores =
    draft.abilities.scores !== undefined && Object.keys(draft.abilities.scores).length > 0

  const isComplete =
    unresolved.length === 0 &&
    Boolean(draft.identity.name?.trim()) &&
    Boolean(draft.species.speciesId) &&
    hasAbilityScores

  return { showPreviewNotice: !isComplete }
}

export function projectCharacterDraftDetailSource(args: ProjectCharacterDraftDetailSourceInput): {
  viewModel: ReturnType<typeof buildCharacterDetailViewModel>
  completeness: CharacterDetailProjectionCompleteness
} {
  const source = buildDetailSourceFromDraft(args.draft, args)
  const completeness = assessDraftDetailCompleteness(args.draft, args.resolvedChoiceSets)

  return {
    viewModel: buildCharacterDetailViewModel({
      source,
      catalogIndex: args.catalogIndex,
      rules: args.context.characterCreationRules,
      xpProgression: args.xpProgression,
    }),
    completeness,
  }
}

export function projectCharacterBuilderDraftDetailPreview(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  catalogIndex: CharacterBuildCatalogIndex,
  resolvedChoiceSets: readonly ChoiceSet[],
) {
  return projectCharacterDraftDetailSource({
    draft,
    context,
    catalogIndex,
    resolvedChoiceSets,
    xpProgression: { entries: [] },
  })
}

/** @internal Test hook for draft-only source assembly. */
export function buildCharacterDetailSourceFromDraftForTests(
  args: ProjectCharacterDraftDetailSourceInput,
): CharacterDetailSource {
  return buildDetailSourceFromDraft(args.draft, args)
}

export { getCharacterBuilderTotalLevel }
