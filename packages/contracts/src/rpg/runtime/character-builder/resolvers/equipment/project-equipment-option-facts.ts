import type { Equipment } from '../../../../content/equipment'
import { equipmentIdMatchesReference } from '../../../creature/equipment-id-match'
import type { CharacterProficiencies } from '../../../character/sheet/proficiencies'
import type { CharacterSelectionSource } from '../../../character/sheet/selection-sources'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft/draft'
import type { CharacterClass } from '../../../../content/classes/class'
import {
  NEUTRAL_OPTION_RECOMMENDATION,
  compareSpecificity,
  type OptionRecommendation,
  type OptionRequirement,
  type OptionState,
  type RecommendationSignal,
  type RecommendationSourceRef,
  type OptionPresentationFacts,
  type RequirementDefinition,
  type RequirementState,
} from '../../recommendation'
import type { SourcedEquipmentRecommendationEvidence } from './equipment-recommendation-evidence'
import { classRecommendationSource } from './equipment-recommendation-evidence'
import { listSelectedStartingEquipmentGrantIds } from './derive-starting-equipment-recommendation-contributions'
import {
  nestedStartingEquipmentChoiceSetId,
  readSelectedStartingEquipmentOptionId,
} from './resolve-starting-equipment-choice-sets'
import { findAvailableStartingEquipmentOption } from '../../../../content/starting-equipment-availability'

export type ResolvedEquipmentOption = {
  requirements: readonly OptionRequirement[]
  recommendation: OptionRecommendation
  state: OptionState
  presentation?: OptionPresentationFacts
}

const CHOICE_REASONS = new Set([
  'startingEquipment',
  'startingEquipmentChoice',
  'availableInStartingOption',
  'unresolvedToolProficiencyChoice',
])

const SIGNAL_REASONS = new Set(['classSuggested', 'classToolCategory'])

export function listOwnedEquipmentIds(args: {
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  draft?: CharacterBuilderDraft
}): Set<string> {
  const ids = new Set<string>()
  const draft = args.draft
  for (const purchase of draft?.equipment?.purchases ?? []) ids.add(purchase.equipmentId)
  for (const grant of draft?.equipment?.grants ?? []) ids.add(grant.equipmentId)
  if (!draft) return ids

  for (const equipmentId of listSelectedStartingEquipmentGrantIds({ ...args, draft })) {
    ids.add(equipmentId)
  }
  addNestedStartingPackageChoiceSelections(ids, args, draft)
  return ids
}

function addNestedStartingPackageChoiceSelections(
  ids: Set<string>,
  args: {
    characterClass: CharacterClass
    catalogIndex: CharacterBuildCatalogIndex
    draft?: CharacterBuilderDraft
  },
  draft: CharacterBuilderDraft,
): void {
  const optionId = readSelectedStartingEquipmentOptionId(draft, args.characterClass.id)
  const startingEquipment = args.characterClass.characterCreation?.startingEquipment
  const selectedOption =
    optionId && startingEquipment
      ? findAvailableStartingEquipmentOption(startingEquipment.options, optionId)
      : undefined
  if (!selectedOption || !optionId) return

  for (const [itemIndex, item] of selectedOption.items.entries()) {
    if (item.kind !== 'choice') continue
    const choiceSetId = nestedStartingEquipmentChoiceSetId(
      args.characterClass.id,
      optionId,
      itemIndex,
    )
    for (const equipmentId of draft.choiceSelections[choiceSetId] ?? []) ids.add(equipmentId)
  }
}

export function projectEquipmentCatalogFacts(args: {
  classId: string
  equipment: ReadonlyMap<string, Equipment>
  evidenceById: ReadonlyMap<string, readonly SourcedEquipmentRecommendationEvidence[]>
  proficiencies: CharacterProficiencies
  focusEligibleIds: readonly string[]
  ownedIds: ReadonlySet<string>
}): Map<string, ResolvedEquipmentOption> {
  const owner = classRecommendationSource(args.classId)
  const requirements = buildRequirementDefinitions({
    classId: args.classId,
    owner,
    evidenceById: args.evidenceById,
    focusEligibleIds: args.focusEligibleIds,
  })
  const requirementStates = requirements.map((definition) =>
    requirementStateFor(definition, args.ownedIds),
  )

  const facts = new Map<string, ResolvedEquipmentOption>()
  for (const [equipmentId, equipment] of args.equipment) {
    const evidence = args.evidenceById.get(equipmentId) ?? []
    facts.set(
      equipmentId,
      projectOne({
        equipment,
        evidence,
        owner,
        requirements,
        requirementStates,
        proficiencies: args.proficiencies,
        focusEligibleIds: args.focusEligibleIds,
      }),
    )
  }
  return facts
}

function buildRequirementDefinitions(args: {
  classId: string
  owner: RecommendationSourceRef
  evidenceById: ReadonlyMap<string, readonly SourcedEquipmentRecommendationEvidence[]>
  focusEligibleIds: readonly string[]
}): RequirementDefinition[] {
  const authored: string[] = []
  const requiredGear: string[] = []

  for (const [equipmentId, evidence] of args.evidenceById) {
    for (const entry of evidence) {
      if (entry.reason !== 'classRequired') continue
      if (entry.basis === 'authored') authored.push(equipmentId)
      else requiredGear.push(equipmentId)
    }
  }

  const definitions: RequirementDefinition[] = []
  pushRequirement(definitions, {
    requirementId: `${args.classId}:required-gear`,
    owner: args.owner,
    ids: unique(requiredGear),
  })
  pushRequirement(definitions, {
    requirementId: `${args.classId}:authored-essential`,
    owner: args.owner,
    ids: unique(authored),
  })
  if ((args.focusEligibleIds ?? []).length > 0) {
    definitions.push({
      requirementId: `${args.classId}:spellcasting-focus`,
      owner: args.owner,
      rule: 'anyOf',
      eligibleOptionIds: args.focusEligibleIds,
      detail: { kind: 'spellcastingFocus' },
    })
  }
  return definitions
}

function pushRequirement(
  definitions: RequirementDefinition[],
  args: { requirementId: string; owner: RecommendationSourceRef; ids: readonly string[] },
): void {
  if (args.ids.length === 0) return
  definitions.push({
    requirementId: args.requirementId,
    owner: args.owner,
    rule: args.ids.length === 1 ? 'exact' : 'anyOf',
    eligibleOptionIds: args.ids,
  })
}

function requirementStateFor(
  definition: RequirementDefinition,
  ownedIds: ReadonlySet<string>,
): RequirementState {
  const satisfiedBy = definition.eligibleOptionIds.filter((id) => ownedIds.has(id))
  return {
    requirementId: definition.requirementId,
    satisfied: satisfiedBy.length > 0,
    satisfiedBy,
  }
}

function projectOne(args: {
  equipment: Equipment
  evidence: readonly SourcedEquipmentRecommendationEvidence[]
  owner: RecommendationSourceRef
  requirements: readonly RequirementDefinition[]
  requirementStates: readonly RequirementState[]
  proficiencies: CharacterProficiencies
  focusEligibleIds: readonly string[]
}): ResolvedEquipmentOption {
  return {
    requirements: projectOptionRequirements(args),
    recommendation: projectOptionRecommendation(args.evidence),
    state: projectOptionState(args),
  }
}

function projectOptionRequirements(args: {
  equipment: Equipment
  requirements: readonly RequirementDefinition[]
  requirementStates: readonly RequirementState[]
}): OptionRequirement[] {
  return args.requirements.flatMap((definition, index) => {
    const state = args.requirementStates[index]!
    if (!definition.eligibleOptionIds.includes(args.equipment.id)) return []
    if (state.satisfied && !state.satisfiedBy.includes(args.equipment.id)) return []
    return [
      {
        requirementId: definition.requirementId,
        owner: definition.owner,
        rule: definition.rule,
        role: state.satisfied ? 'satisfier' : 'candidate',
      },
    ]
  })
}

function projectOptionRecommendation(
  evidence: readonly SourcedEquipmentRecommendationEvidence[],
): OptionRecommendation {
  const signals = evidence.flatMap((entry) => recommendationSignalFromEvidence(entry) ?? [])
  if (signals.length === 0) return NEUTRAL_OPTION_RECOMMENDATION
  return { strength: aggregateSignalStrength(signals), signals }
}

function recommendationSignalFromEvidence(
  entry: SourcedEquipmentRecommendationEvidence,
): RecommendationSignal[] {
  if (!SIGNAL_REASONS.has(entry.reason)) return []
  return [
    {
      strength: entry.tier === 'strong' || entry.tier === 'essential' ? 'strong' : 'compatible',
      basis: entry.basis ?? (entry.reason === 'classToolCategory' ? 'affinity' : 'inferred'),
      specificity: entry.specificity,
      ...(entry.source ? { source: entry.source } : {}),
      ...(entry.reason === 'classToolCategory'
        ? { detail: { kind: 'toolCategory' as const, toolCategory: 'tool' } }
        : {}),
    },
  ]
}

function aggregateSignalStrength(
  signals: readonly RecommendationSignal[],
): OptionRecommendation['strength'] {
  if (signals.some((signal) => signal.strength === 'strong')) return 'strong'
  if (signals.some((signal) => signal.strength === 'discouraged')) return 'discouraged'
  return 'compatible'
}

function projectOptionState(args: {
  equipment: Equipment
  evidence: readonly SourcedEquipmentRecommendationEvidence[]
  owner: RecommendationSourceRef
  proficiencies: CharacterProficiencies
  focusEligibleIds: readonly string[]
}): OptionState {
  const state: OptionState = {}
  const choice = projectChoiceState(args.evidence)
  if (choice) state.choice = choice
  const compatibility = projectCompatibilityState(args)
  if (compatibility) state.compatibility = compatibility
  return state
}

function projectChoiceState(
  evidence: readonly SourcedEquipmentRecommendationEvidence[],
): OptionState['choice'] | undefined {
  const choiceEvidence = evidence.filter((entry) => CHOICE_REASONS.has(entry.reason))
  if (choiceEvidence.length === 0) return undefined
  const openPool = choiceEvidence.find((entry) => isOpenPoolChoiceReason(entry.reason))
  return {
    ...(openPool?.choiceSetId ? { choiceSetId: openPool.choiceSetId } : {}),
    inOpenPool: choiceEvidence.some((entry) => isOpenPoolChoiceReason(entry.reason)),
    inSelectedPackage: choiceEvidence.some((entry) => entry.reason === 'startingEquipment'),
    inAlternativePackage: choiceEvidence.some(
      (entry) => entry.reason === 'availableInStartingOption',
    ),
  }
}

function isOpenPoolChoiceReason(reason: SourcedEquipmentRecommendationEvidence['reason']): boolean {
  return reason === 'startingEquipmentChoice' || reason === 'unresolvedToolProficiencyChoice'
}

function projectCompatibilityState(args: {
  equipment: Equipment
  evidence: readonly SourcedEquipmentRecommendationEvidence[]
  owner: RecommendationSourceRef
  proficiencies: CharacterProficiencies
  focusEligibleIds: readonly string[]
}): OptionState['compatibility'] | undefined {
  const proficiencySources = toolProficiencySources(args.equipment, args.proficiencies)
  const isFocus = args.focusEligibleIds.includes(args.equipment.id)
  const tracksProficiency = equipmentTracksProficiency(args.equipment)
  if (!tracksProficiency && proficiencySources.length === 0 && !isFocus) return undefined
  return {
    ...(tracksProficiency
      ? { proficient: args.evidence.some((entry) => entry.reason === 'proficient') }
      : {}),
    ...(proficiencySources.length > 0 ? { proficiencySources } : {}),
    ...(isFocus ? { spellcastingFocusFor: args.owner } : {}),
  }
}

function equipmentTracksProficiency(equipment: Equipment): boolean {
  return equipment.kind === 'weapon' || equipment.kind === 'armor' || equipment.kind === 'tool'
}

function toolProficiencySources(
  equipment: Equipment,
  proficiencies: CharacterProficiencies,
): CharacterSelectionSource[] {
  if (equipment.kind !== 'tool') return []
  const sources: CharacterSelectionSource[] = []
  for (const entry of proficiencies.tools) {
    const matchesItem =
      entry.toolId !== undefined &&
      equipmentIdMatchesReference({
        reference: entry.toolId,
        equipment,
        rulesetId: equipment.rulesetId,
      })
    const matchesCategory =
      entry.toolCategory !== undefined && entry.toolCategory === equipment.toolCategory
    if (!matchesItem && !matchesCategory) continue
    sources.push(...(entry.sources ?? []))
  }
  return sources
}

function unique(ids: readonly string[]): string[] {
  return [...new Set(ids)]
}

export function bestSignalSpecificity(recommendation: OptionRecommendation) {
  return recommendation.signals.reduce<
    (typeof recommendation.signals)[number]['specificity'] | undefined
  >((best, signal) => {
    if (!best) return signal.specificity
    return compareSpecificity(signal.specificity, best) < 0 ? signal.specificity : best
  }, undefined)
}
