import type { OptionPresentationFact, OptionPresentationDiscriminator } from '@rpg/contracts'

import {
  selectionRecommendation,
  selectionRequirement,
  selectionSource,
  selectionWarning,
} from './selection-row-entries.lib'
import type {
  SelectionGuidanceEntry,
  SelectionRowPresentation,
  SelectionStatusEntry,
} from './selection-row-status.types'

type MappedFactEntry =
  | { group: 'status'; entry: SelectionStatusEntry }
  | { group: 'guidance'; entry: SelectionGuidanceEntry }

function sourced(fact: OptionPresentationFact) {
  return {
    label: fact.label,
    ...(fact.sourceKind ? { sourceKind: fact.sourceKind } : {}),
    sourceLabels: fact.sourceLabels,
  }
}

function optionalDetail(fact: OptionPresentationFact) {
  return fact.detail ? { detail: fact.detail } : {}
}

function mapRequirementFact(
  fact: OptionPresentationFact,
  kind: 'requirement' | 'requirement_match',
): MappedFactEntry {
  return {
    group: 'guidance',
    entry: selectionRequirement({
      ...sourced(fact),
      kind,
      role: fact.requirementRole ?? 'candidate',
    }),
  }
}

function mapNotProficient(fact: OptionPresentationFact): MappedFactEntry {
  return {
    group: 'status',
    entry: selectionWarning('not_proficient', fact.label, optionalDetail(fact)),
  }
}

function mapAbilityRequirementUnmet(fact: OptionPresentationFact): MappedFactEntry {
  return {
    group: 'status',
    entry: selectionWarning('ability_score_requirement', fact.label, {
      ...optionalDetail(fact),
      ...(fact.ability ? { subject: fact.ability } : {}),
    }),
  }
}

function mapSourceFact(
  fact: OptionPresentationFact,
  reason: 'in_package' | 'open_pool' | 'alternative_package',
): MappedFactEntry {
  return { group: 'guidance', entry: selectionSource(reason, fact.label) }
}

/** Branches on the discriminator only. `proficient` and `spellcasting-focus` have no row entry. */
const FACT_ENTRY_BY_DISCRIMINATOR: Partial<
  Record<OptionPresentationDiscriminator, (fact: OptionPresentationFact) => MappedFactEntry>
> = {
  required: (fact) => mapRequirementFact(fact, 'requirement'),
  'requirement-match': (fact) => mapRequirementFact(fact, 'requirement_match'),
  recommended: (fact) => ({
    group: 'guidance',
    entry: selectionRecommendation({ ...sourced(fact), owned: fact.owned === true }),
  }),
  'not-proficient': mapNotProficient,
  'ability-requirement-unmet': mapAbilityRequirementUnmet,
  'in-package': (fact) => mapSourceFact(fact, 'in_package'),
  'open-pool': (fact) => mapSourceFact(fact, 'open_pool'),
  'alternative-package': (fact) => mapSourceFact(fact, 'alternative_package'),
}

function entryFromFact(fact: OptionPresentationFact): MappedFactEntry | undefined {
  const discriminator = fact.discriminator
  if (discriminator === undefined) return undefined
  return FACT_ENTRY_BY_DISCRIMINATOR[discriminator]?.(fact)
}

/** Contracts facts → unordered selection entries. Ordering and dedupe happen at render. */
export function selectionPresentationFromFacts(
  facts: readonly OptionPresentationFact[] | undefined,
): SelectionRowPresentation {
  const status: SelectionStatusEntry[] = []
  const guidance: SelectionGuidanceEntry[] = []
  for (const fact of facts ?? []) {
    const mapped = entryFromFact(fact)
    if (mapped?.group === 'status') status.push(mapped.entry)
    if (mapped?.group === 'guidance') guidance.push(mapped.entry)
  }
  return { status, guidance }
}

export function mergeSelectionRowPresentations(
  ...presentations: readonly SelectionRowPresentation[]
): SelectionRowPresentation {
  return {
    status: presentations.flatMap((presentation) => presentation.status),
    guidance: presentations.flatMap((presentation) => presentation.guidance),
  }
}
