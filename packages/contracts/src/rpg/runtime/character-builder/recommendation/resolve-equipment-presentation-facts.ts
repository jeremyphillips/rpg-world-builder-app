import type { CharacterSelectionSource } from '../../character/sheet/selection-sources'
import { getNpcTemplateLabel, type NpcTemplateId } from '../../../vocab/npc/npc-template'

import type { ResolvedEquipmentOption } from '../resolvers/equipment/project-equipment-option-facts'
import { formatRecommendationSourceLabel } from './format-recommendation-source-label'
import type { RecommendationSourceRef } from './recommendation-source-ref'
import {
  grantedByLabel,
  includedQuantityLabel,
  OPTION_PRESENTATION_AVAILABLE_IN_STARTING_OPTION_LABEL,
  OPTION_PRESENTATION_IN_PACKAGE_LABEL,
  OPTION_PRESENTATION_PROFICIENCY_AVAILABLE_LABEL,
  OPTION_PRESENTATION_PROFICIENT_LABEL,
  OPTION_PRESENTATION_SPELLCASTING_FOCUS_LABEL,
  OPTION_PRESENTATION_STARTING_OPTION_LABEL,
  requiredByLabel,
  satisfiesFocusRequirementLabel,
  softRecommendationFact,
  type OptionPresentationFact,
  type OptionPresentationFacts,
  type RecommendationSourceName,
} from './resolve-option-presentation-facts'

export type EquipmentOpenPoolKind = 'toolProficiency' | 'startingEquipment'

export function resolveEquipmentPresentationFacts(args: {
  resolved: ResolvedEquipmentOption
  sourceName?: RecommendationSourceName
  authoredLabel?: string
  openPoolKind?: EquipmentOpenPoolKind
  ownedQuantity?: number
}): OptionPresentationFacts {
  const facts: OptionPresentationFact[] = []
  const requirement = primaryRequirementFact(args.resolved, args.sourceName)
  if (requirement) facts.push(requirement)

  const recommendation = softRecommendationFact({
    recommendation: args.resolved.recommendation,
    sourceName: args.sourceName,
    ...(requirement ? {} : { authoredLabel: args.authoredLabel }),
  })
  if (recommendation) facts.push(recommendation)

  const focus = spellcastingFocusFact(args.resolved, Boolean(requirement))
  if (focus) facts.push(focus)

  const proficient = proficientFact(args.resolved, args.sourceName)
  if (proficient) facts.push(proficient)

  facts.push(...stateFacts(args))
  return { facts }
}

function primaryRequirementFact(
  resolved: ResolvedEquipmentOption,
  sourceName: RecommendationSourceName | undefined,
): OptionPresentationFact | undefined {
  const candidate =
    resolved.requirements.find(
      (requirement) => requirement.role === 'candidate' && requirement.rule === 'exact',
    ) ?? resolved.requirements.find((requirement) => requirement.role === 'candidate')
  if (candidate) {
    return {
      kind: 'requirement',
      label: requiredByLabel(ownerLabel(candidate.owner, sourceName)),
      sourceLabels: [ownerLabel(candidate.owner, sourceName)],
    }
  }

  const satisfier = resolved.requirements.find((requirement) => requirement.role === 'satisfier')
  if (!satisfier) return undefined
  const focusDefinition = resolved.state.compatibility?.spellcastingFocusFor
  if (satisfier.rule === 'anyOf' && focusDefinition) {
    return {
      kind: 'requirement',
      label: satisfiesFocusRequirementLabel(ownerName(satisfier.owner, sourceName)),
      sourceLabels: [ownerLabel(satisfier.owner, sourceName)],
    }
  }
  return {
    kind: 'requirement',
    label: requiredByLabel(ownerLabel(satisfier.owner, sourceName)),
    sourceLabels: [ownerLabel(satisfier.owner, sourceName)],
  }
}

function spellcastingFocusFact(
  resolved: ResolvedEquipmentOption,
  hasRequirement: boolean,
): OptionPresentationFact | undefined {
  if (hasRequirement || !resolved.state.compatibility?.spellcastingFocusFor) return undefined
  return {
    kind: 'compatibility',
    label: OPTION_PRESENTATION_SPELLCASTING_FOCUS_LABEL,
    sourceLabels: [],
  }
}

function proficientFact(
  resolved: ResolvedEquipmentOption,
  sourceName: RecommendationSourceName | undefined,
): OptionPresentationFact | undefined {
  const compatibility = resolved.state.compatibility
  if (!compatibility?.proficient) return undefined
  const sourceLabels = proficiencySourceLabels(compatibility.proficiencySources ?? [], sourceName)
  if (sourceLabels.length === 0) return undefined
  return {
    kind: 'compatibility',
    label: OPTION_PRESENTATION_PROFICIENT_LABEL,
    detail: grantedByLabel(sourceLabels[0]!),
    sourceLabels,
  }
}

function stateFacts(args: {
  resolved: ResolvedEquipmentOption
  openPoolKind?: EquipmentOpenPoolKind
  ownedQuantity?: number
}): OptionPresentationFact[] {
  const facts: OptionPresentationFact[] = []
  const choice = args.resolved.state.choice
  if (args.ownedQuantity !== undefined && args.ownedQuantity > 0) {
    facts.push({
      kind: 'state',
      label: includedQuantityLabel(args.ownedQuantity),
      sourceLabels: [],
    })
  }
  if (choice?.inSelectedPackage) {
    facts.push({
      kind: 'state',
      label: OPTION_PRESENTATION_IN_PACKAGE_LABEL,
      sourceLabels: [],
    })
  }
  if (choice?.inOpenPool) {
    facts.push({
      kind: 'state',
      label:
        args.openPoolKind === 'toolProficiency'
          ? OPTION_PRESENTATION_PROFICIENCY_AVAILABLE_LABEL
          : OPTION_PRESENTATION_STARTING_OPTION_LABEL,
      sourceLabels: [],
    })
  }
  if (choice?.inAlternativePackage) {
    facts.push({
      kind: 'state',
      label: OPTION_PRESENTATION_AVAILABLE_IN_STARTING_OPTION_LABEL,
      sourceLabels: [],
    })
  }
  return facts
}

function proficiencySourceLabels(
  sources: readonly CharacterSelectionSource[],
  sourceName: RecommendationSourceName | undefined,
): string[] {
  const labels: string[] = []
  for (const source of sources) {
    const ref = proficiencySourceRef(source)
    if (!ref) continue
    const label = formatRecommendationSourceLabel(ref, {
      name: sourceName?.(ref) ?? defaultProficiencySourceName(ref),
    })
    if (label && !labels.includes(label)) labels.push(label)
  }
  return labels
}

function proficiencySourceRef(
  source: CharacterSelectionSource,
): RecommendationSourceRef | undefined {
  if (!source.sourceId) return undefined
  if (source.kind === 'classFeature' || source.kind === 'classSpellcasting') {
    return { kind: 'class', id: source.sourceId }
  }
  if (source.kind === 'subclassFeature') return { kind: 'subclass', id: source.sourceId }
  if (source.kind === 'speciesTrait') return { kind: 'species', id: source.sourceId }
  if (source.kind === 'feat') return { kind: 'feat', id: source.sourceId }
  if (source.kind === 'npcTemplate') return { kind: 'role', id: source.sourceId as NpcTemplateId }
  return undefined
}

function defaultProficiencySourceName(source: RecommendationSourceRef): string | undefined {
  if (source.kind === 'role') return getNpcTemplateLabel(source.id)
  return undefined
}

function ownerLabel(
  source: RecommendationSourceRef,
  sourceName: RecommendationSourceName | undefined,
): string {
  return formatRecommendationSourceLabel(source, { name: sourceName?.(source) }) ?? 'Source'
}

function ownerName(
  source: RecommendationSourceRef,
  sourceName: RecommendationSourceName | undefined,
): string {
  return sourceName?.(source)?.trim() || ownerLabel(source, sourceName)
}
