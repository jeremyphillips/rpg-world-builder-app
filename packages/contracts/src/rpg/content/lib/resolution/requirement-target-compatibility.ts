import type { ResolutionTargetKind } from '../../../vocab/resolution'

import type { ResolutionTargetRequirement } from './target-requirements'
import { formatRequirementTargetIncompatibilityMessage } from './requirement-target-messages'

export type RequirementPopulation = 'creature' | 'object'

export type RequirementCompatibilityInput =
  | { kind: 'sight'; who?: 'actor' | 'target' | 'both' }
  | { kind: 'size' }
  | { kind: 'creature-type' }
  | { kind: 'condition' }
  | { kind: 'willing' }
  | { kind: 'any-of' }
  | { kind: 'written' }

export type RequirementListIssueCode =
  | 'duplicate-kind'
  | 'willing-with-any-of'
  | 'condition-with-any-of'

export type RequirementListMenuBlockCode = RequirementListIssueCode

export type RequirementTargetIncompatibilityReason = {
  code: 'target-kind-incompatible'
  input: RequirementCompatibilityInput
  targetKind: ResolutionTargetKind
}

const CREATURE_POPULATIONS = ['creature'] as const satisfies readonly RequirementPopulation[]
const CREATURE_AND_OBJECT = [
  'creature',
  'object',
] as const satisfies readonly RequirementPopulation[]

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function readStoredKind(row: unknown): ResolutionTargetRequirement['kind'] | undefined {
  if (!isObjectRecord(row)) return undefined
  const kind = row.kind
  if (typeof kind !== 'string') return undefined
  switch (kind) {
    case 'sight':
    case 'size':
    case 'creature-type':
    case 'condition':
    case 'willing':
    case 'any-of':
    case 'written':
      return kind
    default:
      return undefined
  }
}

function readSightWho(row: Record<string, unknown>): RequirementCompatibilityInput {
  const who = row.who
  if (who === 'actor' || who === 'target' || who === 'both') {
    return { kind: 'sight', who }
  }
  return { kind: 'sight' }
}

/** Infers applicability shape from partial or complete form/stored rows without Zod. */
export function readRequirementCompatibilityInput(
  row: unknown,
): RequirementCompatibilityInput | undefined {
  const storedKind = readStoredKind(row)
  if (!storedKind) return undefined
  if (storedKind === 'sight') {
    return readSightWho(row as Record<string, unknown>)
  }
  return { kind: storedKind }
}

function populationsForInput(
  input: RequirementCompatibilityInput,
): readonly RequirementPopulation[] | undefined {
  switch (input.kind) {
    case 'sight': {
      if (input.who === 'target' || input.who === 'both') {
        return CREATURE_POPULATIONS
      }
      if (input.who === 'actor') {
        return CREATURE_AND_OBJECT
      }
      return undefined
    }
    case 'written':
      return CREATURE_AND_OBJECT
    case 'size':
    case 'creature-type':
    case 'condition':
    case 'willing':
    case 'any-of':
      return CREATURE_POPULATIONS
    default: {
      const _exhaustive: never = input
      return _exhaustive
    }
  }
}

export function getRequirementAllowedPopulations(
  input: RequirementCompatibilityInput,
): readonly RequirementPopulation[] | undefined {
  return populationsForInput(input)
}

function targetKindAllowsPopulation(
  targetKind: ResolutionTargetKind,
  populations: readonly RequirementPopulation[],
): boolean {
  if (targetKind === 'creature') {
    return populations.includes('creature')
  }
  if (targetKind === 'object') {
    return populations.includes('object')
  }
  return populations.includes('creature') && populations.includes('object')
}

export function isRequirementCompatibleWithTargetKind(
  input: RequirementCompatibilityInput,
  targetKind: ResolutionTargetKind | undefined,
): boolean {
  if (!targetKind) return true
  const populations = populationsForInput(input)
  if (!populations) return true
  return targetKindAllowsPopulation(targetKind, populations)
}

export function getRequirementTargetIncompatibility(
  input: RequirementCompatibilityInput,
  targetKind: ResolutionTargetKind | undefined,
): RequirementTargetIncompatibilityReason | undefined {
  if (!targetKind) return undefined
  if (isRequirementCompatibleWithTargetKind(input, targetKind)) return undefined
  return { code: 'target-kind-incompatible', input, targetKind }
}

export function collectRequirementListIssues(
  rows: readonly ResolutionTargetRequirement[],
): readonly { index: number; code: RequirementListIssueCode }[] {
  const issues: { index: number; code: RequirementListIssueCode }[] = []
  const seen = new Map<ResolutionTargetRequirement['kind'], number>()
  rows.forEach((row, index) => {
    if (seen.has(row.kind)) {
      issues.push({ index, code: 'duplicate-kind' })
      return
    }
    seen.set(row.kind, index)
  })

  const anyOfIndex = seen.get('any-of')
  if (anyOfIndex === undefined) return issues

  if (seen.has('willing')) {
    issues.push({ index: anyOfIndex, code: 'willing-with-any-of' })
  }
  if (seen.has('condition')) {
    issues.push({ index: anyOfIndex, code: 'condition-with-any-of' })
  }

  return issues
}

function storedKindsAfterAppend(
  existingRows: readonly unknown[],
  appendKind: ResolutionTargetRequirement['kind'],
): Set<ResolutionTargetRequirement['kind']> {
  const kinds = new Set<ResolutionTargetRequirement['kind']>()
  for (const row of existingRows) {
    const kind = readStoredKind(row)
    if (kind) kinds.add(kind)
  }
  kinds.add(appendKind)
  return kinds
}

/** Preview list mutex / duplicate when appending from the add menu (stored kinds only). */
export function getRequirementAppendListConflict(
  existingRows: readonly unknown[],
  appendInput: RequirementCompatibilityInput,
): RequirementListMenuBlockCode | undefined {
  const appendKind = appendInput.kind

  for (const row of existingRows) {
    if (readStoredKind(row) === appendKind) {
      return 'duplicate-kind'
    }
  }

  const kinds = storedKindsAfterAppend(existingRows, appendKind)
  if (!kinds.has('any-of')) return undefined

  if (appendKind === 'willing') return 'willing-with-any-of'
  if (appendKind === 'condition') return 'condition-with-any-of'
  if (appendKind === 'any-of') {
    if (existingRows.some((row) => readStoredKind(row) === 'willing')) {
      return 'willing-with-any-of'
    }
    if (existingRows.some((row) => readStoredKind(row) === 'condition')) {
      return 'condition-with-any-of'
    }
  }

  return undefined
}

export function formatRequirementTargetMenuNote(
  reason: { code: RequirementListMenuBlockCode } | RequirementTargetIncompatibilityReason,
): string {
  switch (reason.code) {
    case 'duplicate-kind':
      return 'Already added'
    case 'willing-with-any-of':
    case 'condition-with-any-of':
      return 'Conflicts with an existing requirement'
    case 'target-kind-incompatible':
      return formatRequirementTargetIncompatibilityMessage(reason, 'option')
    default: {
      const _exhaustive: never = reason
      return _exhaustive
    }
  }
}

export function refineRequirementRowsForTargetKind(
  targetKind: ResolutionTargetKind | undefined,
  rows: readonly unknown[],
  onIssue: (index: number, message: string) => void,
): void {
  if (!targetKind) return
  rows.forEach((row, index) => {
    const input = readRequirementCompatibilityInput(row)
    if (!input) return
    const incompatibility = getRequirementTargetIncompatibility(input, targetKind)
    if (!incompatibility) return
    onIssue(index, formatRequirementTargetIncompatibilityMessage(incompatibility, 'validation'))
  })
}

/** Picks one disabled-reason note for add-menu items (duplicate handling is external). */
export function resolveRequirementAddMenuDisabledNote(options: {
  existingRows: readonly unknown[]
  appendInput: RequirementCompatibilityInput
  targetKind: ResolutionTargetKind | undefined
  duplicateBlocked: boolean
}): string | undefined {
  if (options.duplicateBlocked) return 'Already added'
  const listConflict = getRequirementAppendListConflict(options.existingRows, options.appendInput)
  if (listConflict) return formatRequirementTargetMenuNote({ code: listConflict })
  if (!options.targetKind) return undefined
  const incompatibility = getRequirementTargetIncompatibility(
    options.appendInput,
    options.targetKind,
  )
  if (!incompatibility) return undefined
  return formatRequirementTargetMenuNote(incompatibility)
}
