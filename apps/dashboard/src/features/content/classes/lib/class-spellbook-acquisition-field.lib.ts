import type { ClassGainProgression } from '@rpg/contracts'

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

export const SPELLBOOK_GAIN_COLUMN_KEY = 'gain'

const GAIN_COLUMN: TableBuilderFixedColumnDefinition = {
  semanticKey: SPELLBOOK_GAIN_COLUMN_KEY,
  label: 'Spells gained',
  valueType: 'number',
  format: 'plain',
}

function parseGainCell(raw: string | undefined): number | undefined {
  if (raw === undefined || raw.trim() === '') return undefined
  const parsed = Number(raw.replace(/,/g, ''))
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) return undefined
  return parsed
}

function validateGainDraft(draft: TableBuilderFormValues): TableBuilderDraftValidationResult {
  const gainColumnKey = draft.columns[0]?.key
  if (!gainColumnKey) return { valid: true }

  const hasRow = draft.rows.some((row) => {
    const level = parseLevelDraft(row.level ?? '')
    if (level === undefined) return false
    const cell = row.cells[gainColumnKey]
    if (cell === undefined || isTableBuilderCellBlank(cell) || typeof cell !== 'string')
      return false
    return parseGainCell(cell) !== undefined
  })

  if (!hasRow) {
    return {
      valid: false,
      errors: [{ path: 'rows', message: 'Add at least one spell acquisition breakpoint.' }],
    }
  }

  return { valid: true }
}

export function buildClassSpellbookAcquisitionHostConfig(input: {
  allowedLevels: readonly number[]
  extendedProgression?: TableBuilderExtendedProgression
}): TableBuilderHostConfig {
  return {
    allowedKinds: ['levelProgression'],
    recommendedKind: 'levelProgression',
    allowedLevels: input.allowedLevels,
    columns: 'fixed',
    rows: 'editable',
    resolveFixedColumns: () => [GAIN_COLUMN],
    ...(input.extendedProgression ? { extendedProgression: input.extendedProgression } : {}),
    validateDraftBeforeSave: (ctx) => validateGainDraft(ctx.draft),
  }
}

export function buildClassSpellbookAcquisitionDraft(
  acquisition: ClassGainProgression | undefined,
): TableBuilderFormValues {
  const columnKey = createTableBuilderColumnKey()
  const rows = [...(acquisition?.curve.rows ?? [])]
    .sort((left, right) => left.level - right.level)
    .map((row) => ({
      level: String(row.level),
      cells: { [columnKey]: String(row.count) },
    }))

  return {
    kind: 'levelProgression',
    name: 'Spellbook acquisition',
    columns: [
      {
        key: columnKey,
        label: GAIN_COLUMN.label,
        valueType: GAIN_COLUMN.valueType,
        format: GAIN_COLUMN.format ?? 'plain',
      },
    ],
    rows,
  }
}

export function mapClassSpellbookAcquisitionDraftToProgression(
  draft: TableBuilderFormValues,
): ClassGainProgression {
  const gainColumnKey = draft.columns[0]?.key
  const rows: Array<{ level: number; count: number }> = []

  if (gainColumnKey) {
    for (const row of draft.rows) {
      const level = parseLevelDraft(row.level ?? '')
      if (level === undefined) continue
      const cell = row.cells[gainColumnKey]
      if (cell === undefined || isTableBuilderCellBlank(cell) || typeof cell !== 'string') continue
      const count = parseGainCell(cell)
      if (count === undefined) continue
      rows.push({ level, count })
    }
  }

  rows.sort((left, right) => left.level - right.level)

  return {
    curve: { rows },
    extension: 'zero',
  }
}

export function formatClassSpellbookAcquisitionMetadata(
  acquisition: ClassGainProgression | undefined,
  formatSummary: (value: ClassGainProgression | undefined) => string,
): string {
  return formatSummary(acquisition)
}
