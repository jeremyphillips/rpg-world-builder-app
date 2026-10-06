import type { CharacterSelectionSource } from '../../character/sheet/selection-sources'
import type { Equipment } from '../../../content/equipment'
import {
  formatAbilityScoreRequirementLabel,
  formatUnmetAbilityScoreRequirementsDetail,
} from '../../../content/lib/ability-score-requirements'
import { getNpcTemplateLabel, type NpcTemplateId } from '../../../vocab/npc/npc-template'

import {
  equipmentAdvisoryClass,
  resolveEquipmentNotProficientMessage,
  resolveEquipmentNotProficientShortLabel,
} from '../messages/character-builder-advisory-messages'
import type { ResolvedEquipmentOption } from '../resolvers/equipment/project-equipment-option-facts'
import type { OptionRequirement } from './recommendation-envelope'
import { formatRecommendationSourceLabel } from './format-recommendation-source-label'
import type { RecommendationSourceRef } from './recommendation-source-ref'
import {
  grantedByLabel,
  OPTION_PRESENTATION_INCLUDED_IN_PACKAGE_OPTION_LABEL,
  OPTION_PRESENTATION_IN_PACKAGE_LABEL,
  OPTION_PRESENTATION_MATCHES_FOCUS_REQUIREMENT_LABEL,
  OPTION_PRESENTATION_PROFICIENCY_AVAILABLE_LABEL,
  OPTION_PRESENTATION_PROFICIENT_LABEL,
  OPTION_PRESENTATION_SATISFIES_FOCUS_REQUIREMENT_LABEL,
  OPTION_PRESENTATION_SPELLCASTING_FOCUS_LABEL,
  OPTION_PRESENTATION_STARTING_OPTION_LABEL,
  requiredByLabel,
  softRecommendationFacts,
  type OptionPresentationFact,
  type OptionPresentationFacts,
  type OptionPresentationRequirementRole,
  type RecommendationSourceName,
} from './resolve-option-presentation-facts'

export type EquipmentOpenPoolKind = 'toolProficiency' | 'startingEquipment'

/**
 * Every fact the option supports. Satisfied requirements and owned recommendations stay
 * as data (`requirementRole`, `owned`); surfaces decide what to show.
 */
export function resolveEquipmentPresentationFacts(args: {
  resolved: ResolvedEquipmentOption
  equipment?: Equipment
  sourceName?: RecommendationSourceName
  authoredLabel?: string
  openPoolKind?: EquipmentOpenPoolKind
}): OptionPresentationFacts {
  const facts: OptionPresentationFact[] = []
  const requirements = requirementFacts(args.resolved, args.sourceName)
  facts.push(...requirements)

  facts.push(
    ...softRecommendationFacts({
      recommendation: args.resolved.recommendation,
      sourceName: args.sourceName,
      owned: args.resolved.state.owned === true,
      ...(requirements.length > 0 ? {} : { authoredLabel: args.authoredLabel }),
    }),
  )

  const focus = spellcastingFocusFact(args.resolved, requirements.length > 0)
  if (focus) facts.push(focus)

  const proficient = proficientFact(args.resolved, args.sourceName)
  if (proficient) facts.push(proficient)

  const notProficient = notProficientFact(args.resolved, args.equipment)
  if (notProficient) facts.push(notProficient)

  facts.push(...abilityRequirementUnmetFacts(args.resolved))
  facts.push(...stateFacts(args))
  return { facts }
}

type EmittedRequirement = OptionRequirement & { role: OptionPresentationRequirementRole }

function isEmittedRequirement(requirement: OptionRequirement): requirement is EmittedRequirement {
  return requirement.role === 'candidate' || requirement.role === 'satisfier'
}

/** Exact rules first; `eligible` alternates emit nothing. One fact per discriminator, role, and owner kind. */
function requirementFacts(
  resolved: ResolvedEquipmentOption,
  sourceName: RecommendationSourceName | undefined,
): OptionPresentationFact[] {
  const ordered = resolved.requirements
    .filter(isEmittedRequirement)
    .sort((left, right) => Number(left.rule !== 'exact') - Number(right.rule !== 'exact'))
  const facts: OptionPresentationFact[] = []
  for (const requirement of ordered) {
    const fact = requirementFact(requirement, resolved, sourceName)
    const duplicate = facts.some(
      (existing) =>
        existing.discriminator === fact.discriminator &&
        existing.requirementRole === fact.requirementRole &&
        existing.sourceKind === fact.sourceKind,
    )
    if (!duplicate) facts.push(fact)
  }
  return facts
}

function requirementFact(
  requirement: EmittedRequirement,
  resolved: ResolvedEquipmentOption,
  sourceName: RecommendationSourceName | undefined,
): OptionPresentationFact {
  const owner = requirement.owner
  const base = {
    kind: 'requirement' as const,
    sourceKind: owner.kind,
    requirementRole: requirement.role,
    sourceLabels: [ownerLabel(owner, sourceName)],
  }
  if (requirement.rule === 'anyOf' && resolved.state.compatibility?.spellcastingFocusFor) {
    return {
      ...base,
      discriminator: 'requirement-match',
      label:
        requirement.role === 'satisfier'
          ? OPTION_PRESENTATION_SATISFIES_FOCUS_REQUIREMENT_LABEL
          : OPTION_PRESENTATION_MATCHES_FOCUS_REQUIREMENT_LABEL,
    }
  }
  return { ...base, discriminator: 'required', label: requiredByLabel(owner.kind) }
}

function spellcastingFocusFact(
  resolved: ResolvedEquipmentOption,
  hasRequirement: boolean,
): OptionPresentationFact | undefined {
  if (hasRequirement || !resolved.state.compatibility?.spellcastingFocusFor) return undefined
  return {
    kind: 'compatibility',
    discriminator: 'spellcasting-focus',
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
    discriminator: 'proficient',
    label: OPTION_PRESENTATION_PROFICIENT_LABEL,
    detail: grantedByLabel(sourceLabels[0]!),
    sourceLabels,
  }
}

function notProficientFact(
  resolved: ResolvedEquipmentOption,
  equipment: Equipment | undefined,
): OptionPresentationFact | undefined {
  if (resolved.state.compatibility?.proficient !== false || !equipment) return undefined
  const equipmentClass = equipmentAdvisoryClass(equipment)
  if (!equipmentClass) return undefined
  return {
    kind: 'compatibility',
    discriminator: 'not-proficient',
    label: resolveEquipmentNotProficientShortLabel(),
    detail: resolveEquipmentNotProficientMessage(equipmentClass),
    sourceLabels: [],
  }
}

/** One fact per unmet minimum, in `ABILITY_IDS` order (the projection's order). */
function abilityRequirementUnmetFacts(resolved: ResolvedEquipmentOption): OptionPresentationFact[] {
  const unmet = resolved.state.compatibility?.unmetAbilityScoreRequirements ?? []
  return unmet.map((entry) => ({
    kind: 'compatibility',
    discriminator: 'ability-requirement-unmet',
    ability: entry.ability,
    label: formatAbilityScoreRequirementLabel(entry),
    detail: formatUnmetAbilityScoreRequirementsDetail([entry]),
    sourceLabels: [],
  }))
}

function stateFacts(args: {
  resolved: ResolvedEquipmentOption
  openPoolKind?: EquipmentOpenPoolKind
}): OptionPresentationFact[] {
  const facts: OptionPresentationFact[] = []
  const choice = args.resolved.state.choice
  if (choice?.inSelectedPackage) {
    facts.push({
      kind: 'state',
      discriminator: 'in-package',
      label: OPTION_PRESENTATION_IN_PACKAGE_LABEL,
      sourceLabels: [],
    })
  }
  if (choice?.inOpenPool) {
    facts.push({
      kind: 'state',
      discriminator: 'open-pool',
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
      discriminator: 'alternative-package',
      label: OPTION_PRESENTATION_INCLUDED_IN_PACKAGE_OPTION_LABEL,
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
