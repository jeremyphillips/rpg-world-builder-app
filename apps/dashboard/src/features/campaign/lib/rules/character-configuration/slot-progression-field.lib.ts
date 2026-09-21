import type { z } from 'zod'
import {
  formatSpellSlotLevelLabel,
  MAX_SPELL_SLOT_LEVEL,
  normalizeSlotCounts,
  refineLeveledSlotRows,
  refinePactSlotRows,
  type LeveledSlotRow,
  type PactSlotRow,
  type SlotProgression,
} from '@rpg/contracts'

import {
  createFixedLevelsTableBuilderDraft,
  isTableBuilderCellBlank,
  parseLevelDraft,
  type TableBuilderCellDraft,
  type TableBuilderDraftValidationResult,
  type TableBuilderExtendedProgression,
  type TableBuilderFixedColumnDefinition,
  type TableBuilderFormValues,
  type TableBuilderHostConfig,
} from '@/lib/table-builder'
import { buildAllowedLevels } from './xp-thresholds-field.lib'

export const LEVELED_SLOT_COLUMN_KEY_PREFIX = 'slot-level-'
export const PACT_SLOT_COUNT_COLUMN_KEY = 'pact-slot-count'
export const PACT_SLOT_LEVEL_COLUMN_KEY = 'pact-slot-level'

export const PACT_SLOT_COUNT_COLUMN_LABEL = 'Slots'
export const PACT_SLOT_LEVEL_COLUMN_LABEL = 'Slot level'

export type SlotProgressionTableKind = Extract<SlotProgression['kind'], 'leveled' | 'pact'>

/** Data-derived fixed columns for leveled slot matrices (1st–9th). */
export function resolveLeveledSlotFixedColumns(): readonly TableBuilderFixedColumnDefinition[] {
  return Array.from({ length: MAX_SPELL_SLOT_LEVEL }, (_, index) => {
    const slotLevel = index + 1
    return {
      semanticKey: `${LEVELED_SLOT_COLUMN_KEY_PREFIX}${slotLevel}`,
      label: formatSpellSlotLevelLabel(slotLevel),
      valueType: 'number' as const,
      format: 'plain' as const,
    }
  })
}

/** Data-derived fixed columns for pact slot progressions. */
export function resolvePactSlotFixedColumns(): readonly TableBuilderFixedColumnDefinition[] {
  return [
    {
      semanticKey: PACT_SLOT_COUNT_COLUMN_KEY,
      label: PACT_SLOT_COUNT_COLUMN_LABEL,
      valueType: 'number',
      format: 'plain',
    },
    {
      semanticKey: PACT_SLOT_LEVEL_COLUMN_KEY,
      label: PACT_SLOT_LEVEL_COLUMN_LABEL,
      valueType: 'number',
      format: 'plain',
    },
  ]
}

export function resolveSlotProgressionFixedColumns(
  kind: SlotProgressionTableKind,
): readonly TableBuilderFixedColumnDefinition[] {
  return kind === 'leveled' ? resolveLeveledSlotFixedColumns() : resolvePactSlotFixedColumns()
}

function resolveSlotProgressionExtendedProgression(input: {
  effectiveMaxLevel: number
  maxCharacterLevel: number
  extendedTierName?: string
}): TableBuilderExtendedProgression | undefined {
  if (input.effectiveMaxLevel <= input.maxCharacterLevel) return undefined
  const tierName = input.extendedTierName?.trim()
  if (!tierName) return undefined
  return {
    standardMaxLevel: input.maxCharacterLevel,
    tierName,
  }
}

function parseSlotCountCellDraft(raw: TableBuilderCellDraft | undefined): number {
  if (raw === undefined || isTableBuilderCellBlank(raw) || typeof raw !== 'string') return 0
  const parsed = Number(raw.replace(/,/g, ''))
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) return 0
  return parsed
}

function draftToLeveledSlotRows(draft: TableBuilderFormValues): LeveledSlotRow[] {
  const columnKeys = draft.columns.map((column) => column.key)

  return draft.rows
    .map((row) => {
      const level = parseLevelDraft(row.level ?? '')
      if (level === undefined) return null
      const slots = columnKeys.map((key) => parseSlotCountCellDraft(row.cells[key]))
      return { level, slots }
    })
    .filter((row): row is LeveledSlotRow => row !== null)
    .sort((left, right) => left.level - right.level)
}

function draftToPactSlotRows(draft: TableBuilderFormValues): PactSlotRow[] {
  const slotCountKey = draft.columns.find(
    (column) => column.key === PACT_SLOT_COUNT_COLUMN_KEY,
  )?.key
  const slotLevelKey = draft.columns.find(
    (column) => column.key === PACT_SLOT_LEVEL_COLUMN_KEY,
  )?.key
  if (slotCountKey === undefined || slotLevelKey === undefined) return []

  return draft.rows
    .map((row) => {
      const level = parseLevelDraft(row.level ?? '')
      if (level === undefined) return null
      return {
        level,
        slotCount: parseSlotCountCellDraft(row.cells[slotCountKey]),
        slotLevel: parseSlotCountCellDraft(row.cells[slotLevelKey]),
      }
    })
    .filter((row): row is PactSlotRow => row !== null)
    .sort((left, right) => left.level - right.level)
}

type CollectedRefinementIssue = {
  path: (string | number)[]
  message: string
}

function collectLeveledRefinementIssues(
  rows: readonly LeveledSlotRow[],
): CollectedRefinementIssue[] {
  const issues: CollectedRefinementIssue[] = []
  const ctx = {
    addIssue: (issue: { message: string; path?: (string | number)[] }) => {
      issues.push({ path: issue.path ?? [], message: issue.message })
    },
  } as unknown as z.RefinementCtx

  refineLeveledSlotRows(rows, ctx, ['rows'])
  return issues
}

function collectPactRefinementIssues(rows: readonly PactSlotRow[]): CollectedRefinementIssue[] {
  const issues: CollectedRefinementIssue[] = []
  const ctx = {
    addIssue: (issue: { message: string; path?: (string | number)[] }) => {
      issues.push({ path: issue.path ?? [], message: issue.message })
    },
  } as unknown as z.RefinementCtx

  refinePactSlotRows(rows, ctx, ['rows'])
  return issues
}

function findDraftRowIndexByLevel(
  draft: TableBuilderFormValues,
  level: number,
): number | undefined {
  const index = draft.rows.findIndex((row) => parseLevelDraft(row.level ?? '') === level)
  return index >= 0 ? index : undefined
}

// fallow-ignore-next-line complexity
function mapLeveledSlotIssueToFormPath(
  issue: CollectedRefinementIssue,
  draft: TableBuilderFormValues,
  rows: readonly LeveledSlotRow[],
): { path: string; message: string } | null {
  const rowIndex = issue.path[1]
  const field = issue.path[2]
  if (typeof rowIndex !== 'number' || typeof field !== 'string') return null

  const row = rows[rowIndex]
  if (row === undefined) return null

  const draftRowIndex = findDraftRowIndexByLevel(draft, row.level)
  if (draftRowIndex === undefined) return null

  if (field === 'level') {
    return { path: `rows.${draftRowIndex}.level`, message: issue.message }
  }

  if (field === 'slots') {
    const previousRow = rows[rowIndex - 1]
    if (previousRow !== undefined) {
      const previousSlots = normalizeSlotCounts(previousRow.slots)
      const currentSlots = normalizeSlotCounts(row.slots)
      for (let slotLevel = 1; slotLevel <= MAX_SPELL_SLOT_LEVEL; slotLevel += 1) {
        const previousCount = previousSlots[slotLevel - 1] ?? 0
        const currentCount = currentSlots[slotLevel - 1] ?? 0
        if (currentCount < previousCount) {
          const columnKey = draft.columns[slotLevel - 1]?.key
          if (columnKey !== undefined) {
            return {
              path: `rows.${draftRowIndex}.cells.${columnKey}`,
              message: issue.message,
            }
          }
        }
      }
    }

    const fallbackColumnKey = draft.columns[0]?.key
    if (fallbackColumnKey === undefined) return null
    return {
      path: `rows.${draftRowIndex}.cells.${fallbackColumnKey}`,
      message: issue.message,
    }
  }

  return null
}

function mapPactSlotIssueToFormPath(
  issue: CollectedRefinementIssue,
  draft: TableBuilderFormValues,
  rows: readonly PactSlotRow[],
): { path: string; message: string } | null {
  const rowIndex = issue.path[1]
  const field = issue.path[2]
  if (typeof rowIndex !== 'number' || typeof field !== 'string') return null

  const row = rows[rowIndex]
  if (row === undefined) return null

  const draftRowIndex = findDraftRowIndexByLevel(draft, row.level)
  if (draftRowIndex === undefined) return null

  if (field === 'level') {
    return { path: `rows.${draftRowIndex}.level`, message: issue.message }
  }

  if (field === 'slotCount') {
    return {
      path: `rows.${draftRowIndex}.cells.${PACT_SLOT_COUNT_COLUMN_KEY}`,
      message: issue.message,
    }
  }

  if (field === 'slotLevel') {
    return {
      path: `rows.${draftRowIndex}.cells.${PACT_SLOT_LEVEL_COLUMN_KEY}`,
      message: issue.message,
    }
  }

  return null
}

export function validateLeveledSlotProgressionDraft(
  draft: TableBuilderFormValues,
): TableBuilderDraftValidationResult {
  const rows = draftToLeveledSlotRows(draft)
  const issues = collectLeveledRefinementIssues(rows)
  const errors = issues
    .map((issue) => mapLeveledSlotIssueToFormPath(issue, draft, rows))
    .filter((entry): entry is { path: string; message: string } => entry !== null)

  if (errors.length === 0) return { valid: true }
  return { valid: false, errors }
}

export function validatePactSlotProgressionDraft(
  draft: TableBuilderFormValues,
): TableBuilderDraftValidationResult {
  const rows = draftToPactSlotRows(draft)
  const issues = collectPactRefinementIssues(rows)
  const errors = issues
    .map((issue) => mapPactSlotIssueToFormPath(issue, draft, rows))
    .filter((entry): entry is { path: string; message: string } => entry !== null)

  if (errors.length === 0) return { valid: true }
  return { valid: false, errors }
}

export function buildLeveledSlotProgressionHostConfig(input: {
  effectiveMaxLevel: number
  maxCharacterLevel?: number
  extendedTierName?: string
}): TableBuilderHostConfig {
  const maxCharacterLevel = input.maxCharacterLevel ?? 20
  return {
    allowedKinds: ['levelProgression'],
    recommendedKind: 'levelProgression',
    allowedLevels: buildAllowedLevels(input.effectiveMaxLevel),
    columns: 'fixed',
    rows: 'fixedLevels',
    resolveFixedColumns: resolveLeveledSlotFixedColumns,
    extendedProgression: resolveSlotProgressionExtendedProgression({
      effectiveMaxLevel: input.effectiveMaxLevel,
      maxCharacterLevel,
      extendedTierName: input.extendedTierName,
    }),
    validateDraftBeforeSave: (ctx) => validateLeveledSlotProgressionDraft(ctx.draft),
  }
}

export function buildPactSlotProgressionHostConfig(input: {
  effectiveMaxLevel: number
  maxCharacterLevel?: number
  extendedTierName?: string
}): TableBuilderHostConfig {
  const maxCharacterLevel = input.maxCharacterLevel ?? 20
  return {
    allowedKinds: ['levelProgression'],
    recommendedKind: 'levelProgression',
    allowedLevels: buildAllowedLevels(input.effectiveMaxLevel),
    columns: 'fixed',
    rows: 'fixedLevels',
    resolveFixedColumns: resolvePactSlotFixedColumns,
    extendedProgression: resolveSlotProgressionExtendedProgression({
      effectiveMaxLevel: input.effectiveMaxLevel,
      maxCharacterLevel,
      extendedTierName: input.extendedTierName,
    }),
    validateDraftBeforeSave: (ctx) => validatePactSlotProgressionDraft(ctx.draft),
  }
}

function seedLeveledSlotCell(
  level: number,
  columnKey: string,
  rowsByLevel: ReadonlyMap<number, readonly number[]>,
): string | undefined {
  const slots = rowsByLevel.get(level)
  if (slots === undefined) return undefined

  const match = columnKey.match(/^slot-level-(\d+)$/)
  if (match === null) return undefined

  const slotLevel = Number(match[1])
  const count = slots[slotLevel - 1]
  if (count === undefined || count <= 0) return undefined
  return String(count)
}

function seedPactSlotCell(
  level: number,
  columnKey: string,
  rowsByLevel: ReadonlyMap<number, PactSlotRow>,
): string | undefined {
  const row = rowsByLevel.get(level)
  if (row === undefined) return undefined

  if (columnKey === PACT_SLOT_COUNT_COLUMN_KEY) return String(row.slotCount)
  if (columnKey === PACT_SLOT_LEVEL_COLUMN_KEY) return String(row.slotLevel)
  return undefined
}

export function buildLeveledSlotProgressionDraft(input: {
  label: string
  effectiveMaxLevel: number
  seedRows?: readonly LeveledSlotRow[]
  maxCharacterLevel?: number
  extendedTierName?: string
}): TableBuilderFormValues {
  const config = buildLeveledSlotProgressionHostConfig(input)
  const rowsByLevel = new Map(
    input.seedRows?.map((row) => [row.level, normalizeSlotCounts(row.slots)] as const) ?? [],
  )

  return createFixedLevelsTableBuilderDraft(config, {
    name: input.label,
    seedRowCells: (level, columnKey) => seedLeveledSlotCell(level, columnKey, rowsByLevel),
  })
}

export function buildPactSlotProgressionDraft(input: {
  label: string
  effectiveMaxLevel: number
  seedRows?: readonly PactSlotRow[]
  maxCharacterLevel?: number
  extendedTierName?: string
}): TableBuilderFormValues {
  const config = buildPactSlotProgressionHostConfig(input)
  const rowsByLevel = new Map(input.seedRows?.map((row) => [row.level, row] as const) ?? [])

  return createFixedLevelsTableBuilderDraft(config, {
    name: input.label,
    seedRowCells: (level, columnKey) => seedPactSlotCell(level, columnKey, rowsByLevel),
  })
}

export function mapLeveledSlotProgressionDraftToRows(
  draft: TableBuilderFormValues,
): LeveledSlotRow[] {
  return draftToLeveledSlotRows(draft).map((row) => ({
    level: row.level,
    slots: normalizeSlotCounts(row.slots),
  }))
}

export function mapPactSlotProgressionDraftToRows(draft: TableBuilderFormValues): PactSlotRow[] {
  return draftToPactSlotRows(draft)
}

export function formatSlotProgressionMetadata(
  progression: SlotProgression,
  effectiveMaxLevel: number,
): string {
  const authoredMaxLevel = progression.rows.reduce((max, row) => Math.max(max, row.level), 0)
  const derivedCount = Math.max(0, effectiveMaxLevel - authoredMaxLevel)
  const kindLabel = progression.kind === 'pact' ? 'Pact' : 'Leveled'
  const derivedSuffix =
    derivedCount > 0 ? ` · ${derivedCount} level${derivedCount === 1 ? '' : 's'} derived` : ''
  return `${effectiveMaxLevel} levels${derivedSuffix} · ${kindLabel}`
}

export function buildSlotProgressionDraft(
  progression: SlotProgression,
  input: {
    effectiveMaxLevel: number
    maxCharacterLevel?: number
    extendedTierName?: string
  },
): TableBuilderFormValues {
  if (progression.kind === 'pact') {
    return buildPactSlotProgressionDraft({
      label: progression.label,
      effectiveMaxLevel: input.effectiveMaxLevel,
      seedRows: progression.rows,
      maxCharacterLevel: input.maxCharacterLevel,
      extendedTierName: input.extendedTierName,
    })
  }

  return buildLeveledSlotProgressionDraft({
    label: progression.label,
    effectiveMaxLevel: input.effectiveMaxLevel,
    seedRows: progression.rows,
    maxCharacterLevel: input.maxCharacterLevel,
    extendedTierName: input.extendedTierName,
  })
}

export function applySlotProgressionDraft(
  progression: SlotProgression,
  draft: TableBuilderFormValues,
): SlotProgression {
  if (progression.kind === 'pact') {
    return {
      ...progression,
      rows: mapPactSlotProgressionDraftToRows(draft),
    }
  }

  return {
    ...progression,
    rows: mapLeveledSlotProgressionDraftToRows(draft),
  }
}

export function createCustomSlotProgression(input: {
  id: string
  label: string
  kind: SlotProgressionTableKind
}): SlotProgression {
  if (input.kind === 'pact') {
    return {
      id: input.id,
      label: input.label,
      kind: 'pact',
      extension: 'carryForward',
      rows: [{ level: 1, slotCount: 1, slotLevel: 1 }],
    }
  }

  return {
    id: input.id,
    label: input.label,
    kind: 'leveled',
    extension: 'carryForward',
    rows: [{ level: 1, slots: [1] }],
  }
}
