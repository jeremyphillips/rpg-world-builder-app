import { getCreatureSizeLabel } from '../../../vocab/creature-size'
import { getEffectConditionLabel } from '../../../vocab/effect-condition'
import {
  inferResolutionTargetCountKind,
  type ResolutionTargetCountKind,
  type ResolutionTargetKind,
} from '../../../vocab/resolution'
import type { ResolutionTarget, ResolutionTargetProximity } from './schema'

const COUNT_WORDS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
] as const

const MAX_TARGET_COUNT_INDEX = 10

function capitalizeWord(word: string): string {
  if (word.length === 0) return word
  return `${word.charAt(0).toUpperCase()}${word.slice(1)}`
}

/** Authoring select options for target counts one through ten. */
export function resolutionTargetCountSelectOptions(): { value: number; label: string }[] {
  return COUNT_WORDS.slice(1, MAX_TARGET_COUNT_INDEX + 1).map((word, index) => ({
    value: index + 1,
    label: capitalizeWord(word),
  }))
}

export type ResolutionTargetFormatOptions = {
  /** Label for a creature-type id. Defaults to capitalizing the id. */
  creatureTypeLabel?: (id: string) => string
}

type RequirementRecord = Record<string, unknown>

function defaultCreatureTypeLabel(id: string): string {
  if (id.length === 0) return id
  return id.charAt(0).toUpperCase() + id.slice(1)
}

function creatureTypeLabel(id: string, options?: ResolutionTargetFormatOptions): string {
  return options?.creatureTypeLabel?.(id) ?? defaultCreatureTypeLabel(id)
}

function formatDistanceFeet(distance: { value: number; unit: 'ft' }): string {
  return `${distance.value} feet`
}

/** Proximity phrase only — e.g. "you touch" / "within your reach" / "within 60 feet". */
export function formatResolutionTargetProximityPhrase(
  proximity: ResolutionTargetProximity,
): string {
  switch (proximity.kind) {
    case 'touch':
      return 'you touch'
    case 'reach':
      return proximity.distance
        ? `within ${formatDistanceFeet(proximity.distance)}`
        : 'within your reach'
    case 'distance':
      return `within ${formatDistanceFeet(proximity.distance)}`
    default: {
      const _exhaustive: never = proximity
      return _exhaustive
    }
  }
}

/** "One" / "2" / "Up to three". */
export function formatTargetCountPhrase(
  count: number,
  countKind?: ResolutionTargetCountKind,
): string {
  const kind = inferResolutionTargetCountKind(count, countKind)
  if (kind === 'exact' && count === 1) return 'One'
  if (kind === 'exact') return String(count)
  const word = COUNT_WORDS[count]
  return `Up to ${word ?? String(count)}`
}

function isPluralTarget(count: number, countKind?: ResolutionTargetCountKind): boolean {
  const kind = inferResolutionTargetCountKind(count, countKind)
  return !(kind === 'exact' && count === 1)
}

function pluralizeLabel(label: string): string {
  if (/[^aeiou]y$/i.test(label)) return `${label.slice(0, -1)}ies`
  if (/(?:s|x|z|ch|sh)$/i.test(label)) return `${label}es`
  return `${label}s`
}

function joinOr(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} or ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, or ${items.at(-1)}`
}

function articleFor(label: string): 'a' | 'an' {
  return /^[aeiou]/i.test(label) ? 'an' : 'a'
}

function requirementRecord(value: unknown): RequirementRecord | undefined {
  if (!value || typeof value !== 'object') return undefined
  return value as RequirementRecord
}

function requirementKind(row: RequirementRecord): string | undefined {
  return typeof row.kind === 'string' ? row.kind : undefined
}

function stringIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((id): id is string => typeof id === 'string' && id.length > 0)
}

function findRequirement(
  requirements: readonly unknown[] | undefined,
  kind: string,
): RequirementRecord | undefined {
  for (const value of requirements ?? []) {
    const row = requirementRecord(value)
    if (row && requirementKind(row) === kind) return row
  }
  return undefined
}

function formatKindNoun(kind: ResolutionTargetKind, plural: boolean): string {
  switch (kind) {
    case 'creature':
      return plural ? 'creatures' : 'creature'
    case 'object':
      return plural ? 'objects' : 'object'
    case 'creature-or-object':
      return plural ? 'creatures or objects' : 'creature or object'
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

function formatSizeAdjective(row: RequirementRecord | undefined): string | undefined {
  if (!row || typeof row.bound !== 'string' || typeof row.comparison !== 'string') return undefined
  const label = getCreatureSizeLabel(row.bound)
  switch (row.comparison) {
    case 'or-smaller':
      return `${label} or smaller`
    case 'or-larger':
      return `${label} or larger`
    case 'only':
      return label
    default:
      return undefined
  }
}

function formatIncludedTypeNoun(
  row: RequirementRecord | undefined,
  plural: boolean,
  options?: ResolutionTargetFormatOptions,
): string | undefined {
  if (!row || row.mode !== 'include') return undefined
  const labels = stringIds(row.ids).map((id) => {
    const label = creatureTypeLabel(id, options)
    return plural ? pluralizeLabel(label) : label
  })
  if (labels.length === 0) return undefined
  return joinOr(labels)
}

/** Size, willing, then the noun. Include-types replace "creature" only. */
export function formatTargetHeadNoun(
  target: Pick<ResolutionTarget, 'count' | 'countKind' | 'kind'> & {
    requirements?: readonly unknown[]
  },
  options?: ResolutionTargetFormatOptions,
): string {
  const plural = isPluralTarget(target.count, target.countKind)
  const requirements = target.requirements
  const included =
    target.kind === 'creature'
      ? formatIncludedTypeNoun(findRequirement(requirements, 'creature-type'), plural, options)
      : undefined
  const noun = included ?? formatKindNoun(target.kind, plural)
  const size = formatSizeAdjective(findRequirement(requirements, 'size'))
  const willing = findRequirement(requirements, 'willing') ? 'willing' : undefined
  return [size, willing, noun].filter((part): part is string => Boolean(part)).join(' ')
}

/** Sight between the noun and the distance. */
export function formatTargetSightPhrase(
  requirements: readonly unknown[] | undefined,
): string | undefined {
  const row = findRequirement(requirements, 'sight')
  switch (row?.who) {
    case 'actor':
      return 'you can see'
    case 'target':
      return 'that can see you'
    case 'both':
      return 'you can see and that can see you'
    default:
      return undefined
  }
}

function formatConditionClause(presence: string, ids: readonly string[]): string | undefined {
  if (ids.length === 0) return undefined
  const labels = joinOr(ids.map((id) => getEffectConditionLabel(id)))
  if (presence === 'has') return `that has the ${labels} condition`
  if (presence === 'lacks') return `that doesn't have the ${labels} condition`
  return undefined
}

function formatExcludeClause(
  requirements: readonly unknown[] | undefined,
  options?: ResolutionTargetFormatOptions,
): string | undefined {
  const row = findRequirement(requirements, 'creature-type')
  if (!row || row.mode !== 'exclude') return undefined
  const labels = stringIds(row.ids).map((id) => {
    const label = creatureTypeLabel(id, options)
    return `${articleFor(label)} ${label}`
  })
  if (labels.length === 0) return undefined
  return `that isn't ${joinOr(labels)}`
}

function formatAnyOfClause(requirements: readonly unknown[] | undefined): string | undefined {
  const row = findRequirement(requirements, 'any-of')
  if (!row) return undefined
  const willing = row.willing === true
  const labels = stringIds(row.conditionIds).map((id) => getEffectConditionLabel(id))
  if (willing && labels.length > 0) {
    return `that is willing or has the ${joinOr(labels)} condition`
  }
  if (willing) return 'that is willing'
  if (labels.length > 0) return `that has the ${joinOr(labels)} condition`
  return undefined
}

function formatWrittenClause(requirements: readonly unknown[] | undefined): string | undefined {
  const row = findRequirement(requirements, 'written')
  if (!row || typeof row.text !== 'string') return undefined
  const text = row.text.trim()
  return text.length > 0 ? text : undefined
}

/** Exclude, condition, any-of, then the written clause. */
export function formatTargetQualifyingClauses(
  target: { kind: ResolutionTargetKind; requirements?: readonly unknown[] },
  options?: ResolutionTargetFormatOptions,
): string[] {
  const requirements = target.requirements
  const condition = findRequirement(requirements, 'condition')
  const conditionClause =
    condition && typeof condition.presence === 'string'
      ? formatConditionClause(condition.presence, stringIds(condition.ids))
      : undefined
  const includedOnNonCreature =
    target.kind === 'creature'
      ? undefined
      : formatIncludedTypeAsClause(findRequirement(requirements, 'creature-type'), options)
  return [
    formatExcludeClause(requirements, options),
    includedOnNonCreature,
    conditionClause,
    formatAnyOfClause(requirements),
    formatWrittenClause(requirements),
  ].filter((clause): clause is string => Boolean(clause))
}

function formatIncludedTypeAsClause(
  row: RequirementRecord | undefined,
  options?: ResolutionTargetFormatOptions,
): string | undefined {
  if (!row || row.mode !== 'include') return undefined
  const labels = stringIds(row.ids).map((id) => {
    const label = creatureTypeLabel(id, options)
    return `${articleFor(label)} ${label}`
  })
  if (labels.length === 0) return undefined
  return `that is ${joinOr(labels)}`
}

/** Area-occupant creature phrase — e.g. "creature that isn't an Undead". */
export function formatAreaOccupantCreaturePhrase(
  requirements: readonly unknown[] | undefined,
  options?: ResolutionTargetFormatOptions,
): string {
  const head = formatTargetHeadNoun(
    { count: 1, countKind: 'exact', kind: 'creature', requirements },
    options,
  )
  const sight = formatTargetSightPhrase(requirements)
  const core = [head, sight].filter((part): part is string => Boolean(part)).join(' ')
  const clauses = formatTargetQualifyingClauses({ kind: 'creature', requirements }, options)
  if (clauses.length === 0) return core
  return `${core} ${clauses.join(' and ')}`
}

/** Count, head noun, sight, proximity, then qualifying clauses. */
export function formatResolutionTargetSentence(
  target: Pick<ResolutionTarget, 'count' | 'countKind' | 'kind' | 'proximity'> & {
    requirements?: readonly unknown[]
  },
  options?: ResolutionTargetFormatOptions,
): string {
  const parts = [
    formatTargetCountPhrase(target.count, target.countKind),
    formatTargetHeadNoun(target, options),
    formatTargetSightPhrase(target.requirements),
    formatResolutionTargetProximityPhrase(target.proximity),
  ].filter((part): part is string => Boolean(part))
  const clauses = formatTargetQualifyingClauses(target, options)
  const sentence = parts.join(' ')
  if (clauses.length === 0) return sentence
  return `${sentence} ${clauses.join(' and ')}`
}
