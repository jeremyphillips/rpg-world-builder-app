import type { CharacterClass } from '../../../content/classes/class'
import type { StartingEquipmentOption } from '../../../content/starting-equipment'
import { isStartingGoldOption } from '../../../content/starting-equipment'
import { availableStartingEquipmentOptions } from '../../../content/starting-equipment-availability'
import type { ChoiceSet } from '../choice-set'
import type { CharacterBuildCatalogIndex, CharacterBuildContext } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'
import { characterBuilderValidationMessages } from '../messages/character-builder-messages'
import { resolvePlayableBuilderContent } from '../preview/resolve-playable-builder-content'
import { getChoiceSetStepId } from '../steps'
import { validationIssue } from '../validate/issue'
import type { CharacterBuildValidationIssue } from '../validate/types'
import { startingEquipmentChoiceSetId } from '../resolvers/equipment/resolve-starting-equipment-choice-sets'
import {
  deriveEquipmentDraftEntries,
  inventoryContainsEquipmentId,
} from '../resolvers/equipment/derive-equipment-draft-entries'
import { ensureEquipmentGrant } from '../resolvers/equipment/ensure-equipment-grant'
import { optionIdentityKeys, optionIsHeld } from '../option-identity'
import type { NpcRecommendationSource, SourcedRecommendation } from '../sourced-recommendation'
import {
  recommendationSourceRefsFromNpcSources,
  type RecommendationSourceIdentity,
  type RecommendationSourceRef,
} from '../recommendation'
import { resolveRecommendedSpellIdsForChoiceSet } from '../resolvers/spellcasting/resolve-spell-recommendations'
import type { AutomaticNpcBuildConstraints } from './automatic-npc-build-constraints'
import type { AutomaticNpcBuildPreferences } from './automatic-npc-build-seed'
import {
  bestEquipmentPreferenceMatchForReachableIds,
  collectHeldEquipmentSlugKeys,
  compareEquipmentPreferenceTuples,
  equipmentPreferenceTuple,
  filterHeldEquipmentPreferences,
  NO_EQUIPMENT_PREFERENCE_MATCH,
  suggestedSourcesForEquipmentPreferenceMatch,
  type NpcEquipmentPreferenceEntry,
} from './equipment-preference-stream'
import { collectReachableStartingEquipmentFromPackage } from './list-reachable-starting-equipment'
import { startingEquipmentOptionProvidesWeapon } from './list-reachable-starting-weapons'

function recommendationIdentityForFill(
  draft: CharacterBuilderDraft,
  preferences: AutomaticNpcBuildPreferences | undefined,
): RecommendationSourceIdentity {
  return {
    ...preferences?.recommendationIdentity,
    classId: draft.class.classId ?? preferences?.recommendationIdentity?.classId,
    speciesId: draft.species.speciesId ?? preferences?.recommendationIdentity?.speciesId,
    roleId: draft.npcTemplateId ?? preferences?.recommendationIdentity?.roleId,
  }
}

function classRecommendedSpellOptionIds(args: {
  choiceSet: ChoiceSet
  characterClass: CharacterClass | undefined
  catalogIndex: CharacterBuildCatalogIndex
  classLevel: number
}): string[] {
  if (!args.characterClass) return []
  if (args.choiceSet.choiceType !== 'spell' && args.choiceSet.choiceType !== 'cantrip') return []
  return [
    ...resolveRecommendedSpellIdsForChoiceSet({
      spellcasting: args.characterClass.spellcasting,
      choiceSetId: args.choiceSet.id,
      classId: args.characterClass.id,
      classLevel: args.classLevel,
      choiceSetOptionIds: args.choiceSet.options.map((option) => option.id),
      catalogSpellsById: args.catalogIndex.spells,
    }),
  ]
}

function preferredConstraintOptionIds(
  choiceSet: ChoiceSet,
  constraints: AutomaticNpcBuildConstraints | undefined,
): string[] {
  const preferred: string[] = []
  if (!constraints) return preferred

  for (const spellId of constraints.requiredSpellIds) {
    if (
      (choiceSet.choiceType === 'spell' || choiceSet.choiceType === 'cantrip') &&
      choiceSet.options.some((option) => option.id === spellId)
    ) {
      preferred.push(spellId)
    }
  }

  for (const weaponId of constraints.requiredWeaponIds) {
    if (
      choiceSet.choiceType === 'equipment' &&
      choiceSet.options.some((option) => option.id === weaponId)
    ) {
      preferred.push(weaponId)
    }
  }

  const canonicalOrder = choiceSet.options.map((option) => option.id)
  return preferred.sort(
    (left, right) => canonicalOrder.indexOf(left) - canonicalOrder.indexOf(right),
  )
}

function legalChoiceOptionIds(choiceSet: ChoiceSet): Set<string> {
  return new Set(choiceSet.options.map((option) => option.id))
}

/** Selections outside the current ChoiceSet do not count as satisfied. */
function retainLegalChoiceSelections(
  current: readonly string[],
  legalOptionIds: ReadonlySet<string>,
): string[] {
  return current.filter((optionId) => legalOptionIds.has(optionId))
}

function authoredStartingEquipmentOptionIds(characterClass: CharacterClass): Set<string> {
  const startingEquipment = characterClass.characterCreation?.startingEquipment
  if (!startingEquipment) return new Set()
  return new Set(
    availableStartingEquipmentOptions(startingEquipment.options).map((option) => option.id),
  )
}

function startingPackageProvidesAllRequiredWeapons(args: {
  option: StartingEquipmentOption
  requiredWeaponIds: readonly string[]
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
}): boolean {
  return args.requiredWeaponIds.every((weaponId) =>
    startingEquipmentOptionProvidesWeapon({
      option: args.option,
      weaponId,
      characterClass: args.characterClass,
      catalogIndex: args.catalogIndex,
    }),
  )
}

function scoreStartingEquipmentPackageOption(args: {
  option: StartingEquipmentOption
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  stream: readonly NpcEquipmentPreferenceEntry[]
}) {
  const reachable = collectReachableStartingEquipmentFromPackage({
    option: args.option,
    characterClass: args.characterClass,
    catalogIndex: args.catalogIndex,
  })
  const match = bestEquipmentPreferenceMatchForReachableIds({
    equipmentIds: reachable.map((item) => item.id),
    stream: args.stream,
    catalogIndex: args.catalogIndex,
  })
  return {
    tuple: match?.tuple ?? NO_EQUIPMENT_PREFERENCE_MATCH,
    match,
    reachableIds: reachable.map((item) => item.id),
  }
}

function scoreStartingEquipmentPackageChoiceOption(args: {
  option: ChoiceSet['options'][number]
  canonicalIndex: number
  startingEquipment: NonNullable<CharacterClass['characterCreation']>['startingEquipment']
  authoredOptionIds: ReadonlySet<string>
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  stream: readonly NpcEquipmentPreferenceEntry[]
}) {
  const packageOption = args.startingEquipment?.options.find((entry) => entry.id === args.option.id)
  if (
    !packageOption ||
    !args.authoredOptionIds.has(args.option.id) ||
    isStartingGoldOption(packageOption)
  ) {
    return {
      optionId: args.option.id,
      tuple: NO_EQUIPMENT_PREFERENCE_MATCH,
      match: undefined,
      reachableIds: [] as string[],
      canonicalIndex: args.canonicalIndex,
    }
  }
  const scored = scoreStartingEquipmentPackageOption({
    option: packageOption,
    characterClass: args.characterClass,
    catalogIndex: args.catalogIndex,
    stream: args.stream,
  })
  return {
    optionId: args.option.id,
    tuple: scored.tuple,
    match: scored.match,
    reachableIds: scored.reachableIds,
    canonicalIndex: args.canonicalIndex,
  }
}

function selectStartingEquipmentPackageByPreferences(args: {
  choiceSet: ChoiceSet
  current: readonly string[]
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  preferences: AutomaticNpcBuildPreferences
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
}): {
  packageIds: string[]
  suggestedBy: Record<string, readonly RecommendationSourceRef[]>
  legalCurrent: string[]
} | null {
  const { choiceSet, current, characterClass, catalogIndex, preferences, draft, context } = args
  const authoredOptionIds = authoredStartingEquipmentOptionIds(characterClass)
  const legalOptionIds = legalChoiceOptionIds(choiceSet)
  for (const optionId of [...legalOptionIds]) {
    if (!authoredOptionIds.has(optionId)) legalOptionIds.delete(optionId)
  }
  const legalCurrent = retainLegalChoiceSelections(current, legalOptionIds)
  const needed = Math.max(0, choiceSet.min - legalCurrent.length)
  if (needed === 0) return { packageIds: [], suggestedBy: {}, legalCurrent }

  const startingEquipment = characterClass.characterCreation?.startingEquipment
  const stream = filterHeldEquipmentPreferences(
    preferences.equipmentPreferences ?? [],
    collectHeldEquipmentSlugKeys({ draft, catalogIndex, context }),
  )
  if (!startingEquipment || stream.length === 0) return null

  const ranked = choiceSet.options
    .map((option, canonicalIndex) =>
      scoreStartingEquipmentPackageChoiceOption({
        option,
        canonicalIndex,
        startingEquipment,
        authoredOptionIds,
        characterClass,
        catalogIndex,
        stream,
      }),
    )
    .sort((left, right) => {
      const tupleDelta = compareEquipmentPreferenceTuples(left.tuple, right.tuple)
      if (tupleDelta !== 0) return tupleDelta
      return left.canonicalIndex - right.canonicalIndex
    })

  return packagePreferenceWinnerResult({
    ranked,
    authoredOptionIds,
    needed,
    legalCurrent,
    stream,
    draft,
    preferences,
  })
}

function packagePreferenceWinnerResult(args: {
  ranked: Array<{
    optionId: string
    match: ReturnType<typeof scoreStartingEquipmentPackageOption>['match']
    reachableIds: string[]
  }>
  authoredOptionIds: ReadonlySet<string>
  needed: number
  legalCurrent: string[]
  stream: readonly NpcEquipmentPreferenceEntry[]
  draft: CharacterBuilderDraft
  preferences: AutomaticNpcBuildPreferences
}): {
  packageIds: string[]
  suggestedBy: Record<string, readonly RecommendationSourceRef[]>
  legalCurrent: string[]
} | null {
  const winner = args.ranked.find((entry) => args.authoredOptionIds.has(entry.optionId))
  if (!winner) return null

  const suggestedBy: Record<string, readonly RecommendationSourceRef[]> = {}
  const sources =
    winner.match && args.authoredOptionIds.has(winner.optionId)
      ? recommendationSourceRefsFromNpcSources(
          suggestedSourcesForEquipmentPreferenceMatch(
            args.stream,
            winner.match,
            winner.reachableIds,
          ),
          recommendationIdentityForFill(args.draft, args.preferences),
        )
      : []
  if (sources.length > 0) suggestedBy[winner.optionId] = sources

  return {
    packageIds: [winner.optionId].slice(0, args.needed),
    suggestedBy,
    legalCurrent: args.legalCurrent,
  }
}

function selectStartingEquipmentPackageIds(args: {
  choiceSet: ChoiceSet
  current: readonly string[]
  constraints: AutomaticNpcBuildConstraints
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
}): string[] | null {
  const { choiceSet, current, constraints, characterClass, catalogIndex } = args
  const legalCurrent = retainLegalChoiceSelections(current, legalChoiceOptionIds(choiceSet))
  const needed = Math.max(0, choiceSet.min - legalCurrent.length)
  if (needed === 0) return []

  const startingEquipment = characterClass.characterCreation?.startingEquipment
  if (!startingEquipment || constraints.requiredWeaponIds.length === 0) return null

  const eligible = choiceSet.options
    .map((option) => option.id)
    .filter((optionId) => {
      const option = startingEquipment.options.find((entry) => entry.id === optionId)
      if (!option) return false
      return startingPackageProvidesAllRequiredWeapons({
        option,
        requiredWeaponIds: constraints.requiredWeaponIds,
        characterClass,
        catalogIndex,
      })
    })

  if (eligible.length > 0) return eligible.slice(0, needed)

  const fallback = choiceSet.options.map((option) => option.id).slice(0, needed)
  return fallback.length > 0 ? fallback : null
}

const CHOICE_SET_SOFT_PREFERENCE_KEYS = {
  skillProficiency: 'skills',
  toolProficiency: 'tools',
  language: 'languages',
} as const satisfies Partial<Record<ChoiceSet['choiceType'], keyof AutomaticNpcBuildPreferences>>

const EQUIPMENT_CLASSIFIED_CHOICE_TYPES = new Set<ChoiceSet['choiceType']>([
  'weaponProficiency',
  'armorTraining',
])

/**
 * Weapon and armor choices reuse the equipment preference stream. Option identity
 * drops slugs that are not in that choice set, so this does not invent a grant.
 */
function sourcedEquipmentPreferences(
  stream: readonly NpcEquipmentPreferenceEntry[] | undefined,
): SourcedRecommendation[] {
  if (!stream || stream.length === 0) return []
  const sorted = [...stream].sort((left, right) =>
    compareEquipmentPreferenceTuples(
      equipmentPreferenceTuple(left),
      equipmentPreferenceTuple(right),
    ),
  )
  const sourcesBySlug = new Map<string, NpcRecommendationSource[]>()
  const order: string[] = []
  for (const entry of sorted) {
    const sources = sourcesBySlug.get(entry.slug)
    if (!sources) {
      sourcesBySlug.set(entry.slug, [entry.source])
      order.push(entry.slug)
      continue
    }
    if (!sources.includes(entry.source)) sources.push(entry.source)
  }
  return order.map((id) => ({ id, sources: sourcesBySlug.get(id)! }))
}

function preferenceEntriesForChoiceSet(
  choiceSet: ChoiceSet,
  preferences: AutomaticNpcBuildPreferences | undefined,
): readonly SourcedRecommendation[] {
  if (!preferences) return []
  if (EQUIPMENT_CLASSIFIED_CHOICE_TYPES.has(choiceSet.choiceType)) {
    return sourcedEquipmentPreferences(preferences.equipmentPreferences)
  }
  const key =
    CHOICE_SET_SOFT_PREFERENCE_KEYS[
      choiceSet.choiceType as keyof typeof CHOICE_SET_SOFT_PREFERENCE_KEYS
    ]
  if (!key) return []
  const entries = preferences[key]
  return Array.isArray(entries) ? entries : []
}

function equipmentChoiceOptionsInPreferenceOrder(args: {
  choiceSet: ChoiceSet
  preferences: AutomaticNpcBuildPreferences | undefined
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  context: CharacterBuildContext
}): ChoiceSet['options'] {
  const stream = filterHeldEquipmentPreferences(
    args.preferences?.equipmentPreferences ?? [],
    collectHeldEquipmentSlugKeys({
      draft: args.draft,
      catalogIndex: args.catalogIndex,
      context: args.context,
    }),
  )
  if (stream.length === 0) return [...args.choiceSet.options]

  return [...args.choiceSet.options]
    .map((option, canonicalIndex) => {
      const match = bestEquipmentPreferenceMatchForReachableIds({
        equipmentIds: [option.id],
        stream,
        catalogIndex: args.catalogIndex,
      })
      return {
        option,
        tuple: match?.tuple ?? NO_EQUIPMENT_PREFERENCE_MATCH,
        canonicalIndex,
      }
    })
    .sort((left, right) => {
      const tupleDelta = compareEquipmentPreferenceTuples(left.tuple, right.tuple)
      if (tupleDelta !== 0) return tupleDelta
      return left.canonicalIndex - right.canonicalIndex
    })
    .map((entry) => entry.option)
}

const HELD_SKIP_CHOICE_TYPES = new Set<ChoiceSet['choiceType']>([
  'skillProficiency',
  'toolProficiency',
  'language',
])

function choiceOptionIsHeld(
  choiceSet: ChoiceSet,
  optionId: string,
  heldKeys: ReadonlySet<string> | undefined,
): boolean {
  if (!HELD_SKIP_CHOICE_TYPES.has(choiceSet.choiceType)) return false
  if (!heldKeys || heldKeys.size === 0) return false
  return optionIsHeld(optionId, heldKeys)
}

function matchChoiceOption(choiceSet: ChoiceSet, idOrSlug: string): string | undefined {
  return choiceSet.options.find((option) => optionIdentityKeys(option.id).includes(idOrSlug))?.id
}

function usesEquipmentPreferenceOrderingForChoiceSet(args: {
  choiceSet: ChoiceSet
  preferences?: AutomaticNpcBuildPreferences
  equipmentPreferenceCatalogIndex?: CharacterBuildCatalogIndex
  equipmentPreferenceDraft?: CharacterBuilderDraft
  equipmentPreferenceContext?: CharacterBuildContext
}): boolean {
  const classId = args.equipmentPreferenceDraft?.class.classId
  const isTopLevelStartingEquipmentPackage =
    classId !== undefined && args.choiceSet.id === startingEquipmentChoiceSetId(classId)
  return (
    args.choiceSet.choiceType === 'equipment' &&
    !isTopLevelStartingEquipmentPackage &&
    args.equipmentPreferenceCatalogIndex !== undefined &&
    args.equipmentPreferenceDraft !== undefined &&
    args.equipmentPreferenceContext !== undefined &&
    (args.preferences?.equipmentPreferences?.length ?? 0) > 0
  )
}

function appendEquipmentPreferenceOrderedOptions(args: {
  choiceSet: ChoiceSet
  preferences?: AutomaticNpcBuildPreferences
  equipmentPreferenceCatalogIndex: CharacterBuildCatalogIndex
  equipmentPreferenceDraft: CharacterBuilderDraft
  equipmentPreferenceContext: CharacterBuildContext
  canonicalOptions: ChoiceSet['options']
  needed: number
  take: (optionId: string, sources: readonly RecommendationSourceRef[] | undefined) => void
  additions: readonly string[]
}): void {
  const stream = filterHeldEquipmentPreferences(
    args.preferences?.equipmentPreferences ?? [],
    collectHeldEquipmentSlugKeys({
      draft: args.equipmentPreferenceDraft,
      catalogIndex: args.equipmentPreferenceCatalogIndex,
      context: args.equipmentPreferenceContext,
    }),
  )
  for (const option of args.canonicalOptions) {
    if (args.additions.length >= args.needed) break
    const match = bestEquipmentPreferenceMatchForReachableIds({
      equipmentIds: [option.id],
      stream,
      catalogIndex: args.equipmentPreferenceCatalogIndex,
    })
    const sources = recommendationSourceRefsFromNpcSources(
      suggestedSourcesForEquipmentPreferenceMatch(stream, match, [option.id]),
      recommendationIdentityForFill(args.equipmentPreferenceDraft, args.preferences),
    )
    args.take(option.id, sources.length > 0 ? sources : undefined)
  }
}

function resolveStartingEquipmentPackageFill(args: {
  draft: CharacterBuilderDraft
  choiceSet: ChoiceSet
  current: readonly string[]
  constraints: AutomaticNpcBuildConstraints | undefined
  preferences?: AutomaticNpcBuildPreferences
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  context: CharacterBuildContext
}): ConstraintAwareChoiceFill | null | undefined {
  if (args.choiceSet.id !== startingEquipmentChoiceSetId(args.characterClass.id)) return undefined

  if (args.constraints && args.constraints.requiredWeaponIds.length > 0) {
    const packageIds = selectStartingEquipmentPackageIds({
      choiceSet: args.choiceSet,
      current: args.current,
      constraints: args.constraints,
      characterClass: args.characterClass,
      catalogIndex: args.catalogIndex,
    })
    if (packageIds === null) return null
    return {
      draft: {
        ...args.draft,
        choiceSelections: {
          ...args.draft.choiceSelections,
          [args.choiceSet.id]: [...args.current, ...packageIds],
        },
      },
      suggestedBy: {},
    }
  }

  if (!args.preferences?.equipmentPreferences?.length) return undefined

  const preferred = selectStartingEquipmentPackageByPreferences({
    choiceSet: args.choiceSet,
    current: args.current,
    characterClass: args.characterClass,
    catalogIndex: args.catalogIndex,
    preferences: args.preferences,
    draft: args.draft,
    context: args.context,
  })
  if (!preferred) return undefined

  return {
    draft: {
      ...args.draft,
      choiceSelections: {
        ...args.draft.choiceSelections,
        [args.choiceSet.id]: [...preferred.legalCurrent, ...preferred.packageIds],
      },
    },
    suggestedBy: preferred.suggestedBy,
  }
}

type ChoiceFillTake = (
  optionId: string,
  sources: readonly RecommendationSourceRef[] | undefined,
) => void

type ChoiceSetFillState = {
  additions: string[]
  suggestedBy: Record<string, readonly RecommendationSourceRef[]>
}

function createChoiceFillTake(args: {
  needed: number
  selected: ReadonlySet<string>
  state: ChoiceSetFillState
  choiceSet: ChoiceSet
  heldKeys?: ReadonlySet<string>
}): ChoiceFillTake {
  return (optionId, sources) => {
    if (args.state.additions.length >= args.needed) return
    if (args.selected.has(optionId) || args.state.additions.includes(optionId)) return
    if (choiceOptionIsHeld(args.choiceSet, optionId, args.heldKeys)) return
    args.state.additions.push(optionId)
    args.state.suggestedBy[optionId] = sources ? [...sources] : []
  }
}

function takeListedChoiceOptions(args: {
  ids: readonly string[]
  choiceSet: ChoiceSet
  take: ChoiceFillTake
  sourcesFor: (optionId: string) => readonly RecommendationSourceRef[] | undefined
}): void {
  for (const optionId of args.ids) {
    if (!args.choiceSet.options.some((option) => option.id === optionId)) continue
    args.take(optionId, args.sourcesFor(optionId))
  }
}

function takePreferenceChoiceOptions(args: {
  choiceSet: ChoiceSet
  preferences: readonly SourcedRecommendation[]
  identity: RecommendationSourceIdentity
  take: ChoiceFillTake
}): void {
  for (const preference of args.preferences) {
    const optionId = matchChoiceOption(args.choiceSet, preference.id)
    if (!optionId) continue
    args.take(optionId, recommendationSourceRefsFromNpcSources(preference.sources, args.identity))
  }
}

function takeCanonicalChoiceOptions(
  args: Parameters<typeof selectChoiceSetFill>[0] & {
    needed: number
    state: ChoiceSetFillState
    take: ChoiceFillTake
  },
): void {
  if (!usesEquipmentPreferenceOrderingForChoiceSet(args)) {
    for (const option of args.choiceSet.options) args.take(option.id, undefined)
    return
  }

  appendEquipmentPreferenceOrderedOptions({
    choiceSet: args.choiceSet,
    preferences: args.preferences,
    equipmentPreferenceCatalogIndex: args.equipmentPreferenceCatalogIndex!,
    equipmentPreferenceDraft: args.equipmentPreferenceDraft!,
    equipmentPreferenceContext: args.equipmentPreferenceContext!,
    canonicalOptions: equipmentChoiceOptionsInPreferenceOrder({
      choiceSet: args.choiceSet,
      preferences: args.preferences,
      draft: args.equipmentPreferenceDraft!,
      catalogIndex: args.equipmentPreferenceCatalogIndex!,
      context: args.equipmentPreferenceContext!,
    }),
    needed: args.needed,
    take: args.take,
    additions: args.state.additions,
  })
}

/**
 * Preference-then-canonical fill for one ChoiceSet.
 * Already-held options are skipped and do not satisfy the required count.
 * `suggestedBy` records the sources for each added id. Canonical order is `[]`.
 * Ids already present in `current` are not attributed.
 */
export function selectChoiceSetFill(args: {
  choiceSet: ChoiceSet
  current: readonly string[]
  preferences?: AutomaticNpcBuildPreferences
  heldKeys?: ReadonlySet<string>
  hardPreferredIds?: readonly string[]
  /** Class spell recommendations, after hard constraints and before canonical order. */
  classRecommendedIds?: readonly string[]
  classSource?: RecommendationSourceRef
  recommendationIdentity?: RecommendationSourceIdentity
  equipmentPreferenceCatalogIndex?: CharacterBuildCatalogIndex
  equipmentPreferenceDraft?: CharacterBuilderDraft
  equipmentPreferenceContext?: CharacterBuildContext
}): ChoiceSetFillState {
  const legalCurrent = retainLegalChoiceSelections(
    args.current,
    legalChoiceOptionIds(args.choiceSet),
  )
  const needed = Math.max(0, args.choiceSet.min - legalCurrent.length)
  if (needed === 0) return { additions: [], suggestedBy: {} }

  const state: ChoiceSetFillState = { additions: [], suggestedBy: {} }
  const take = createChoiceFillTake({
    needed,
    selected: new Set(legalCurrent),
    state,
    choiceSet: args.choiceSet,
    heldKeys: args.heldKeys,
  })
  const classSource = args.classSource ? [args.classSource] : []

  takeListedChoiceOptions({
    ids: args.hardPreferredIds ?? [],
    choiceSet: args.choiceSet,
    take,
    sourcesFor: () => undefined,
  })
  takeListedChoiceOptions({
    ids: args.classRecommendedIds ?? [],
    choiceSet: args.choiceSet,
    take,
    sourcesFor: () => classSource,
  })
  takePreferenceChoiceOptions({
    choiceSet: args.choiceSet,
    preferences: preferenceEntriesForChoiceSet(args.choiceSet, args.preferences),
    identity: args.recommendationIdentity ?? {},
    take,
  })
  takeCanonicalChoiceOptions({ ...args, needed, state, take })

  return state
}

/**
 * Fills one required ChoiceSet with hard constraints, then soft preferences,
 * then remaining first-eligible defaults in canonical resolver order.
 * Soft preferences never fail a build. Already-held options are skipped.
 */
export type ConstraintAwareChoiceFill = {
  draft: CharacterBuilderDraft
  /** Sources for ids this call added. Seeded ids are absent. */
  suggestedBy: Record<string, readonly RecommendationSourceRef[]>
}

export function fillChoiceSetWithConstraintAwareSelection(args: {
  draft: CharacterBuilderDraft
  choiceSet: ChoiceSet
  constraints: AutomaticNpcBuildConstraints | undefined
  preferences?: AutomaticNpcBuildPreferences
  heldKeys?: ReadonlySet<string>
  characterClass: CharacterClass | undefined
  catalogIndex: CharacterBuildCatalogIndex
  context: CharacterBuildContext
}): ConstraintAwareChoiceFill | null {
  const {
    draft,
    choiceSet,
    constraints,
    preferences,
    heldKeys,
    characterClass,
    catalogIndex,
    context,
  } = args
  const current = draft.choiceSelections[choiceSet.id] ?? []
  const legalCurrent = retainLegalChoiceSelections(current, legalChoiceOptionIds(choiceSet))

  if (characterClass) {
    const startingEquipmentFill = resolveStartingEquipmentPackageFill({
      draft,
      choiceSet,
      current: legalCurrent,
      constraints,
      preferences,
      characterClass,
      catalogIndex,
      context,
    })
    if (startingEquipmentFill === null) return null
    if (startingEquipmentFill) return startingEquipmentFill
  }

  const identity = recommendationIdentityForFill(draft, preferences)
  const filled = selectChoiceSetFill({
    choiceSet,
    current: legalCurrent,
    preferences,
    heldKeys,
    hardPreferredIds: preferredConstraintOptionIds(choiceSet, constraints),
    classRecommendedIds: classRecommendedSpellOptionIds({
      choiceSet,
      characterClass,
      catalogIndex,
      classLevel: draft.class.level,
    }),
    ...(characterClass ? { classSource: { kind: 'class', id: characterClass.id } } : {}),
    recommendationIdentity: identity,
    equipmentPreferenceCatalogIndex: catalogIndex,
    equipmentPreferenceDraft: draft,
    equipmentPreferenceContext: context,
  })
  if (filled.additions.length === 0 && legalCurrent.length === current.length) return null
  const additions = filled.additions

  const selections = [...legalCurrent, ...additions]
  return {
    draft: {
      ...draft,
      choiceSelections: { ...draft.choiceSelections, [choiceSet.id]: selections },
    },
    suggestedBy: filled.suggestedBy,
  }
}

function unsatisfiedChoiceSetIssue(choiceSet: ChoiceSet): CharacterBuildValidationIssue {
  return validationIssue(
    'choice_set_unsatisfied',
    characterBuilderValidationMessages.choiceSetUnsatisfied({
      label: choiceSet.label,
      min: choiceSet.min,
    }),
    { stepId: getChoiceSetStepId(choiceSet), choiceSetId: choiceSet.id },
  )
}

function constraintUnsatisfiableIssue(constraintLabel: string): CharacterBuildValidationIssue {
  return validationIssue(
    'automatic_constraint_unsatisfiable',
    characterBuilderValidationMessages.automaticConstraintUnsatisfiable({ constraintLabel }),
    { stepId: 'equipment' },
  )
}

function weaponConstraintFailureIssue(
  constraints: AutomaticNpcBuildConstraints,
  choiceSet: ChoiceSet,
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterBuildValidationIssue | undefined {
  if (constraints.requiredWeaponIds.length === 0 || choiceSet.sourceType !== 'class') {
    return undefined
  }
  const characterClass = catalogIndex.classes.get(choiceSet.sourceId)
  if (!characterClass || choiceSet.id !== startingEquipmentChoiceSetId(characterClass.id)) {
    return undefined
  }

  const startingEquipment = characterClass.characterCreation?.startingEquipment
  if (!startingEquipment) return undefined

  const hasEligiblePackage = availableStartingEquipmentOptions(startingEquipment.options).some(
    (option) =>
      startingPackageProvidesAllRequiredWeapons({
        option,
        requiredWeaponIds: constraints.requiredWeaponIds,
        characterClass,
        catalogIndex,
      }),
  )
  if (hasEligiblePackage) return undefined

  const firstWeaponId = constraints.requiredWeaponIds[0]
  const weapon = firstWeaponId ? catalogIndex.equipment.get(firstWeaponId) : undefined
  return constraintUnsatisfiableIssue(weapon?.name ?? 'weapon')
}

function spellConstraintFailureIssue(
  constraints: AutomaticNpcBuildConstraints,
  choiceSet: ChoiceSet,
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterBuildValidationIssue | undefined {
  if (constraints.requiredSpellIds.length === 0) return undefined
  if (choiceSet.choiceType !== 'spell' && choiceSet.choiceType !== 'cantrip') return undefined

  const unsatisfiedSpellId = constraints.requiredSpellIds.find(
    (spellId) => !choiceSet.options.some((option) => option.id === spellId),
  )
  if (!unsatisfiedSpellId) return undefined

  const spell = catalogIndex.spells.get(unsatisfiedSpellId)
  const fallback = choiceSet.choiceType === 'cantrip' ? 'cantrip' : 'spell'
  return constraintUnsatisfiableIssue(spell?.name ?? fallback)
}

export function automaticNpcConstraintFailureIssue(
  constraints: AutomaticNpcBuildConstraints | undefined,
  choiceSet: ChoiceSet,
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterBuildValidationIssue {
  if (constraints) {
    const weaponIssue = weaponConstraintFailureIssue(constraints, choiceSet, catalogIndex)
    if (weaponIssue) return weaponIssue
    const spellIssue = spellConstraintFailureIssue(constraints, choiceSet, catalogIndex)
    if (spellIssue) return spellIssue
  }

  return unsatisfiedChoiceSetIssue(choiceSet)
}

function collectChoiceSelectionIds(draft: CharacterBuilderDraft): Set<string> {
  const selectedIds = new Set<string>()
  for (const selections of Object.values(draft.choiceSelections)) {
    for (const optionId of selections ?? []) {
      selectedIds.add(optionId)
    }
  }
  return selectedIds
}

function validateRequiredSpellsSatisfied(
  selectedIds: ReadonlySet<string>,
  requiredSpellIds: readonly string[],
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterBuildValidationIssue | undefined {
  for (const spellId of requiredSpellIds) {
    if (selectedIds.has(spellId)) continue
    const spell = catalogIndex.spells.get(spellId)
    return constraintUnsatisfiableIssue(spell?.name ?? 'spell')
  }
  return undefined
}

function validateRequiredWeaponsSatisfied(
  draft: CharacterBuilderDraft,
  requiredWeaponIds: readonly string[],
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterBuildValidationIssue | undefined {
  const inventory = deriveEquipmentDraftEntries(draft, catalogIndex)

  for (const weaponId of requiredWeaponIds) {
    if (inventoryContainsEquipmentId(inventory, weaponId)) continue
    const weapon = catalogIndex.equipment.get(weaponId)
    return constraintUnsatisfiableIssue(weapon?.name ?? 'weapon')
  }
  return undefined
}

type RequiredWeaponGrantCompletion =
  | { ok: true; draft: CharacterBuilderDraft }
  | { ok: false; issues: CharacterBuildValidationIssue[] }

/**
 * After package/pool bias, applies domain ensure grants for required weapons still
 * missing from assembled inventory. Rejects campaign-unavailable ids before grant.
 */
export function applyRequiredWeaponEquipmentGrants(args: {
  draft: CharacterBuilderDraft
  constraints: AutomaticNpcBuildConstraints | undefined
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
}): RequiredWeaponGrantCompletion {
  const { draft, constraints, context, catalogIndex } = args
  if (!constraints || constraints.requiredWeaponIds.length === 0) {
    return { ok: true, draft }
  }

  const availableEquipmentIds = new Set(
    resolvePlayableBuilderContent(context).equipment.map((equipment) => equipment.id),
  )
  let nextDraft = draft

  for (const weaponId of constraints.requiredWeaponIds) {
    if (!availableEquipmentIds.has(weaponId)) {
      const weapon = catalogIndex.equipment.get(weaponId)
      return {
        ok: false,
        issues: [constraintUnsatisfiableIssue(weapon?.name ?? 'weapon')],
      }
    }

    const inventory = deriveEquipmentDraftEntries(nextDraft, catalogIndex)
    if (inventoryContainsEquipmentId(inventory, weaponId)) continue

    const grantResult = ensureEquipmentGrant({
      draft: nextDraft,
      equipmentId: weaponId,
      quantity: 1,
      catalogIndex,
    })
    if (!grantResult.ok) {
      const weapon = catalogIndex.equipment.get(weaponId)
      return {
        ok: false,
        issues: [constraintUnsatisfiableIssue(weapon?.name ?? 'weapon')],
      }
    }
    nextDraft = grantResult.draft
  }

  return { ok: true, draft: nextDraft }
}

export type ManualEquipmentGrantCompletion =
  | { ok: true; draft: CharacterBuilderDraft }
  | { ok: false; issues: CharacterBuildValidationIssue[] }

/**
 * Grants explicit equipment ids still missing from assembled inventory.
 * Callers must enforce campaign availability before invoking.
 */
export function applyManualEquipmentGrants(args: {
  draft: CharacterBuilderDraft
  equipmentIds: readonly string[]
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
}): ManualEquipmentGrantCompletion {
  const { equipmentIds, context, catalogIndex } = args
  if (equipmentIds.length === 0) {
    return { ok: true, draft: args.draft }
  }

  const availableEquipmentIds = new Set(
    resolvePlayableBuilderContent(context).equipment.map((equipment) => equipment.id),
  )
  let nextDraft = args.draft

  for (const equipmentId of equipmentIds) {
    if (!availableEquipmentIds.has(equipmentId)) {
      const equipment = catalogIndex.equipment.get(equipmentId)
      return {
        ok: false,
        issues: [constraintUnsatisfiableIssue(equipment?.name ?? 'equipment')],
      }
    }

    const inventory = deriveEquipmentDraftEntries(nextDraft, catalogIndex)
    if (inventoryContainsEquipmentId(inventory, equipmentId)) continue

    const grantResult = ensureEquipmentGrant({
      draft: nextDraft,
      equipmentId,
      quantity: 1,
      catalogIndex,
    })
    if (!grantResult.ok) {
      const equipment = catalogIndex.equipment.get(equipmentId)
      return {
        ok: false,
        issues: [constraintUnsatisfiableIssue(equipment?.name ?? 'equipment')],
      }
    }
    nextDraft = grantResult.draft
  }

  return { ok: true, draft: nextDraft }
}

/** Verifies every hard requirement id appears in the resolved draft choice selections. */
export function validateAutomaticNpcConstraintsSatisfied(
  draft: CharacterBuilderDraft,
  constraints: AutomaticNpcBuildConstraints | undefined,
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterBuildValidationIssue | undefined {
  if (!constraints) return undefined

  const selectedIds = collectChoiceSelectionIds(draft)
  const spellIssue = validateRequiredSpellsSatisfied(
    selectedIds,
    constraints.requiredSpellIds,
    catalogIndex,
  )
  if (spellIssue) return spellIssue

  return validateRequiredWeaponsSatisfied(draft, constraints.requiredWeaponIds, catalogIndex)
}
