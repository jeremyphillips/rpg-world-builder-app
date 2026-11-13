import { creatureSizeSchema, getCreatureSizeLabel } from '../../../vocab/creature-size'
import { creatureTypeSchema } from '../../../vocab/creature-type'
import { getEffectConditionEntry, getEffectConditionLabel } from '../../../vocab/effect-condition'
import type { ResolutionTargetRequirement } from './target-requirements'

export type ResolutionRequirementRowTitleOptions = {
  /** Label for a creature-type id. Defaults to capitalizing the id. */
  creatureTypeLabel?: (id: string) => string
}

type RequirementRecord = Record<string, unknown>

const INCOMPLETE_LABELS: Record<ResolutionTargetRequirement['kind'], string> = {
  sight: 'Sight',
  size: 'Creature size',
  'creature-type': 'Creature type',
  condition: 'Condition',
  willing: 'Willing',
  'any-of': 'Condition',
  written: 'Custom requirement',
}

const SIGHT_WHO = new Set(['actor', 'target', 'both'])

function defaultCreatureTypeLabel(id: string): string {
  if (id.length === 0) return id
  return id.charAt(0).toUpperCase() + id.slice(1)
}

function resolveCreatureTypeLabel(
  id: string,
  options?: ResolutionRequirementRowTitleOptions,
): string {
  return options?.creatureTypeLabel?.(id) ?? defaultCreatureTypeLabel(id)
}

function requirementRecord(row: unknown): RequirementRecord | undefined {
  if (!row || typeof row !== 'object') return undefined
  return row as RequirementRecord
}

function stringIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((id): id is string => typeof id === 'string' && id.length > 0)
}

function joinOr(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} or ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, or ${items.at(-1)}`
}

function joinAnd(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`
}

function isKnownConditionId(id: string): boolean {
  return getEffectConditionEntry(id) !== undefined
}

function resolvedConditionLabels(ids: readonly string[]): string[] {
  return ids.filter(isKnownConditionId).map((id) => getEffectConditionLabel(id))
}

function resolvedCreatureTypeIds(
  ids: readonly string[],
  options?: ResolutionRequirementRowTitleOptions,
): string[] {
  const labelFor = (id: string) => resolveCreatureTypeLabel(id, options)
  return stringIds(ids).filter((id) => {
    if (!creatureTypeSchema.safeParse(id).success) return false
    const label = labelFor(id)
    return label.length > 0
  })
}

function isSizeBoundComplete(bound: unknown): bound is string {
  return typeof bound === 'string' && creatureSizeSchema.safeParse(bound).success
}

function isSightComplete(record: RequirementRecord): boolean {
  return typeof record.who === 'string' && SIGHT_WHO.has(record.who)
}

function isSizeComplete(record: RequirementRecord): boolean {
  return isSizeBoundComplete(record.bound)
}

function isCreatureTypeComplete(
  record: RequirementRecord,
  options?: ResolutionRequirementRowTitleOptions,
): boolean {
  return resolvedCreatureTypeIds(record.ids, options).length > 0
}

function isConditionComplete(record: RequirementRecord): boolean {
  return resolvedConditionLabels(stringIds(record.ids)).length > 0
}

function isAnyOfComplete(record: RequirementRecord): boolean {
  if (record.willing === true) return true
  return resolvedConditionLabels(stringIds(record.conditionIds)).length > 0
}

function isWrittenComplete(record: RequirementRecord): boolean {
  return typeof record.text === 'string' && record.text.trim().length > 0
}

function isRequirementAuthoringComplete(
  kind: ResolutionTargetRequirement['kind'],
  record: RequirementRecord,
  options?: ResolutionRequirementRowTitleOptions,
): boolean {
  switch (kind) {
    case 'sight':
      return isSightComplete(record)
    case 'size':
      return isSizeComplete(record)
    case 'creature-type':
      return isCreatureTypeComplete(record, options)
    case 'condition':
      return isConditionComplete(record)
    case 'willing':
      return true
    case 'any-of':
      return isAnyOfComplete(record)
    case 'written':
      return isWrittenComplete(record)
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

function formatSightTitle(record: RequirementRecord): string {
  switch (record.who) {
    case 'target':
      return 'It can see you'
    case 'both':
      return 'You and the target can see each other'
    case 'actor':
      return 'You can see it'
    default:
      return INCOMPLETE_LABELS.sight
  }
}

function formatSizeTitle(record: RequirementRecord): string {
  if (!isSizeBoundComplete(record.bound)) return INCOMPLETE_LABELS.size
  const label = getCreatureSizeLabel(record.bound)
  switch (record.comparison) {
    case 'or-smaller':
      return `${label} or smaller`
    case 'or-larger':
      return `${label} or larger`
    case 'only':
      return `${label} only`
    default:
      return `${label} or smaller`
  }
}

function formatCreatureTypeTitle(
  record: RequirementRecord,
  options?: ResolutionRequirementRowTitleOptions,
): string {
  const ids = resolvedCreatureTypeIds(record.ids, options)
  if (ids.length === 0) return INCOMPLETE_LABELS['creature-type']
  const labels = ids.map((id) => resolveCreatureTypeLabel(id, options))
  if (record.mode === 'exclude') {
    if (labels.length === 1) return `Not ${labels[0]}`
    return `Excludes ${joinAnd(labels)}`
  }
  return joinOr(labels)
}

function formatConditionListPhrase(presence: string, labels: readonly string[]): string {
  if (labels.length === 0) return INCOMPLETE_LABELS.condition
  if (labels.length === 1) {
    if (presence === 'lacks') return `Does not have the ${labels[0]} condition`
    return `Has the ${labels[0]} condition`
  }
  const list = joinOr(labels)
  if (presence === 'lacks') return `Has none of these conditions: ${list}`
  return `Has any of these conditions: ${list}`
}

function formatConditionTitle(record: RequirementRecord): string {
  const presence = typeof record.presence === 'string' ? record.presence : 'has'
  const labels = resolvedConditionLabels(stringIds(record.ids))
  return formatConditionListPhrase(presence, labels)
}

function formatAnyOfConditionPhrase(labels: readonly string[]): string {
  if (labels.length === 0) return ''
  if (labels.length === 1) return `has the ${labels[0]} condition`
  return `has any of these conditions: ${joinOr(labels)}`
}

function formatAnyOfTitle(record: RequirementRecord): string {
  const willing = record.willing === true
  const labels = resolvedConditionLabels(stringIds(record.conditionIds))
  const conditionPhrase = formatAnyOfConditionPhrase(labels)
  if (willing && conditionPhrase) return `Willing or ${conditionPhrase}`
  if (willing) return 'Willing'
  if (conditionPhrase) {
    return conditionPhrase.charAt(0).toUpperCase() + conditionPhrase.slice(1)
  }
  return INCOMPLETE_LABELS['any-of']
}

function formatWrittenTitle(record: RequirementRecord): string {
  const text = typeof record.text === 'string' ? record.text.trim() : ''
  return text.length > 0 ? text : INCOMPLETE_LABELS.written
}

function formatConfiguredTitle(
  kind: ResolutionTargetRequirement['kind'],
  record: RequirementRecord,
  options?: ResolutionRequirementRowTitleOptions,
): string {
  switch (kind) {
    case 'sight':
      return formatSightTitle(record)
    case 'size':
      return formatSizeTitle(record)
    case 'creature-type':
      return formatCreatureTypeTitle(record, options)
    case 'condition':
      return formatConditionTitle(record)
    case 'willing':
      return 'Willing'
    case 'any-of':
      return formatAnyOfTitle(record)
    case 'written':
      return formatWrittenTitle(record)
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

function resolveRequirementKind(
  row: RequirementRecord,
): ResolutionTargetRequirement['kind'] | undefined {
  const kind = row.kind
  if (typeof kind !== 'string') return undefined
  if (kind in INCOMPLETE_LABELS) return kind as ResolutionTargetRequirement['kind']
  return undefined
}

/** Row title for one target requirement — incomplete type label or configured copy. */
export function formatResolutionRequirementRowTitle(
  row: unknown,
  options?: ResolutionRequirementRowTitleOptions,
): string {
  const record = requirementRecord(row)
  if (!record) return 'Requirement'
  const kind = resolveRequirementKind(record)
  if (!kind) return 'Requirement'
  if (!isRequirementAuthoringComplete(kind, record, options)) {
    return INCOMPLETE_LABELS[kind]
  }
  return formatConfiguredTitle(kind, record, options)
}
