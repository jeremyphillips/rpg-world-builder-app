import type { ClassCapacityProgression } from '@rpg/contracts'
import { classCapacityProgressionValidationMessages } from '@rpg/contracts'

import {
  isTableBuilderCellBlank,
  parseLevelDraft,
  type TableBuilderFormValues,
} from '@/lib/table-builder'
import { createTableBuilderColumnKey } from '../../lib/table-builder/table-builder-draft'
import type {
  TableBuilderDraftValidationResult,
  TableBuilderExtendedProgression,
  TableBuilderFixedColumnDefinition,
  TableBuilderHostConfig,
} from '../../lib/table-builder/table-builder-host-config'

export const CLASS_CANTRIP_COUNT_COLUMN_KEY = 'cantrips'

export function resolveClassCantripFixedColumns(): readonly TableBuilderFixedColumnDefinition[] {
  return [
    {
      semanticKey: CLASS_CANTRIP_COUNT_COLUMN_KEY,
      label: 'Cantrips',
      valueType: 'number',
      format: 'plain',
    },
  ]
}

function parseCantripCountCell(raw: string | undefined): number | undefined {
  if (raw === undefined || raw.trim() === '') return undefined
  const parsed = Number(raw.replace(/,/g, ''))
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) return undefined
  return parsed
}

export function mapClassCantripProgressionDraftToRows(
  draft: TableBuilderFormValues,
): ClassCapacityProgression['curve']['rows'] {
  const columnKey = draft.columns[0]?.key
  if (columnKey === undefined) return []

  return draft.rows
    .map((row) => {
      const level = parseLevelDraft(row.level ?? '')
      if (level === undefined) return null
      const cell = row.cells[columnKey]
      if (cell === undefined || isTableBuilderCellBlank(cell) || typeof cell !== 'string') {
        return null
      }
      const count = parseCantripCountCell(cell)
      if (count === undefined) return null
      return { level, count }
    })
    .filter((row): row is { level: number; count: number } => row !== null)
    .sort((left, right) => left.level - right.level)
}

function collectCantripIncrementIssues(
  rows: readonly { level: number; count: number }[],
): Array<{ level: number; previous: number; next: number }> {
  const issues: Array<{ level: number; previous: number; next: number }> = []
  let previousCount: number | undefined

  for (const row of rows) {
    if (previousCount !== undefined && row.count <= previousCount) {
      issues.push({ level: row.level, previous: previousCount, next: row.count })
    }
    previousCount = row.count
  }

  return issues
}

export function validateClassCantripProgressionDraft(
  draft: TableBuilderFormValues,
): TableBuilderDraftValidationResult {
  const rows = mapClassCantripProgressionDraftToRows(draft)
  if (rows.length === 0) {
    return {
      valid: false,
      errors: [
        {
          path: 'rows',
          message: classCapacityProgressionValidationMessages.emptyCurve(),
        },
      ],
    }
  }

  const incrementIssues = collectCantripIncrementIssues(rows)
  if (incrementIssues.length === 0) return { valid: true }

  return {
    valid: false,
    errors: incrementIssues.map((issue) => ({
      path: 'rows',
      message: classCapacityProgressionValidationMessages.countMustIncrease(issue),
    })),
  }
}

export function buildClassCantripProgressionHostConfig(input: {
  allowedLevels: readonly number[]
  extendedProgression?: TableBuilderExtendedProgression
}): TableBuilderHostConfig {
  return {
    allowedKinds: ['levelProgression'],
    recommendedKind: 'levelProgression',
    allowedLevels: input.allowedLevels,
    columns: 'fixed',
    rows: 'editable',
    resolveFixedColumns: resolveClassCantripFixedColumns,
    ...(input.extendedProgression ? { extendedProgression: input.extendedProgression } : {}),
    validateDraftBeforeSave: (ctx) => validateClassCantripProgressionDraft(ctx.draft),
  }
}

export function buildClassCantripProgressionDraft(
  cantrips: ClassCapacityProgression | undefined,
  input: {
    allowedLevels: readonly number[]
    extendedProgression?: TableBuilderExtendedProgression
  },
): TableBuilderFormValues {
  const config = buildClassCantripProgressionHostConfig(input)
  const fixedColumns = config.resolveFixedColumns?.() ?? config.fixedColumns ?? []
  const columns = fixedColumns.map((column) => ({
    key: createTableBuilderColumnKey(),
    label: column.label,
    valueType: column.valueType,
    format: column.format ?? ('plain' as const),
  }))
  const columnKey = columns[0]?.key

  const rows = (cantrips?.curve.rows ?? [])
    .slice()
    .sort((left, right) => left.level - right.level)
    .map((row) => ({
      level: String(row.level),
      cells:
        columnKey === undefined
          ? {}
          : {
              [columnKey]: String(row.count),
            },
    }))

  return {
    kind: 'levelProgression',
    name: 'Cantrip progression',
    columns,
    rows,
  }
}

export function mapClassCantripProgressionDraftToCantrips(
  draft: TableBuilderFormValues,
): ClassCapacityProgression {
  return {
    curve: { rows: mapClassCantripProgressionDraftToRows(draft) },
    extension: 'carryForward',
  }
}

export function formatClassCantripProgressionMetadata(
  cantrips: ClassCapacityProgression | undefined,
): string {
  const rows = [...(cantrips?.curve.rows ?? [])].sort((left, right) => left.level - right.level)
  const breakpointCount = rows.length
  const breakpointLabel = breakpointCount === 1 ? 'breakpoint' : 'breakpoints'
  if (breakpointCount === 0) {
    return `0 ${breakpointLabel}`
  }

  const levelSummary = rows.map((row) => `L${row.level}: ${row.count}`).join(' · ')
  return `${breakpointCount} ${breakpointLabel} · ${levelSummary}`
}
