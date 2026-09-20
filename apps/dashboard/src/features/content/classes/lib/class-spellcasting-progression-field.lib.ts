import type { ClassSpellcastingProgression, ClassSpellSelection } from '@rpg/contracts'
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

export const SPELLCASTING_CANTIPS_COLUMN_KEY = 'cantrips'
export const SPELLCASTING_REPERTOIRE_COLUMN_KEY = 'repertoire'
export const SPELLCASTING_PREPARED_SPELLS_COLUMN_KEY = 'preparedSpells'

const DEFAULT_L1_COLUMN_LABEL = 'Prepared Spells'

export type SpellcastingProgressionColumnKey =
  | typeof SPELLCASTING_CANTIPS_COLUMN_KEY
  | typeof SPELLCASTING_REPERTOIRE_COLUMN_KEY
  | typeof SPELLCASTING_PREPARED_SPELLS_COLUMN_KEY

function l1ColumnKey(
  spellSelection: ClassSpellSelection | undefined,
): SpellcastingProgressionColumnKey {
  if (spellSelection?.model === 'limitedRepertoire') return SPELLCASTING_REPERTOIRE_COLUMN_KEY
  return SPELLCASTING_PREPARED_SPELLS_COLUMN_KEY
}

function l1ColumnLabel(spellSelection: ClassSpellSelection | undefined): string {
  return spellSelection?.columnLabel ?? DEFAULT_L1_COLUMN_LABEL
}

export function resolveSpellcastingProgressionFixedColumns(input: {
  grantsCantrips: boolean
  spellSelection: ClassSpellSelection | undefined
}): readonly TableBuilderFixedColumnDefinition[] {
  const columns: TableBuilderFixedColumnDefinition[] = []
  if (input.grantsCantrips) {
    columns.push({
      semanticKey: SPELLCASTING_CANTIPS_COLUMN_KEY,
      label: 'Cantrips',
      valueType: 'number',
      format: 'plain',
    })
  }
  if (input.spellSelection) {
    columns.push({
      semanticKey: l1ColumnKey(input.spellSelection),
      label: l1ColumnLabel(input.spellSelection),
      valueType: 'number',
      format: 'plain',
    })
  }
  return columns
}

function parseCountCell(raw: string | undefined): number | undefined {
  if (raw === undefined || raw.trim() === '') return undefined
  const parsed = Number(raw.replace(/,/g, ''))
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) return undefined
  return parsed
}

type MergedRow = {
  level: number
  counts: Partial<Record<SpellcastingProgressionColumnKey, number>>
}

function mergedRowsFromProgression(
  progression: ClassSpellcastingProgression | undefined,
  columnKeys: readonly SpellcastingProgressionColumnKey[],
): MergedRow[] {
  const byLevel = new Map<number, Partial<Record<SpellcastingProgressionColumnKey, number>>>()

  for (const key of columnKeys) {
    const curve = progression?.[key]?.curve.rows ?? []
    for (const row of curve) {
      const existing = byLevel.get(row.level) ?? {}
      existing[key] = row.count
      byLevel.set(row.level, existing)
    }
  }

  return [...byLevel.entries()]
    .sort(([left], [right]) => left - right)
    .map(([level, counts]) => ({ level, counts }))
}

function columnLabelForKey(
  key: SpellcastingProgressionColumnKey,
  spellSelection: ClassSpellSelection | undefined,
): string {
  if (key === SPELLCASTING_CANTIPS_COLUMN_KEY) return 'Cantrips'
  return l1ColumnLabel(spellSelection)
}

function collectIncrementIssues(
  rows: readonly { level: number; count: number }[],
  columnLabel: string,
): Array<{ level: number; previous: number; next: number; columnLabel: string }> {
  const issues: Array<{ level: number; previous: number; next: number; columnLabel: string }> = []
  let previousCount: number | undefined

  for (const row of rows) {
    if (previousCount !== undefined && row.count <= previousCount) {
      issues.push({
        level: row.level,
        previous: previousCount,
        next: row.count,
        columnLabel,
      })
    }
    previousCount = row.count
  }

  return issues
}

// fallow-ignore-next-line complexity
export function validateClassSpellcastingProgressionDraft(
  draft: TableBuilderFormValues,
  input: {
    grantsCantrips: boolean
    spellSelection: ClassSpellSelection | undefined
  },
): TableBuilderDraftValidationResult {
  const fixedColumns = resolveSpellcastingProgressionFixedColumns(input)
  const semanticByKey = new Map(
    draft.columns.map((column, index) => [column.key, fixedColumns[index]?.semanticKey]),
  )

  const rowsByColumn = new Map<
    SpellcastingProgressionColumnKey,
    { level: number; count: number }[]
  >()

  for (const row of draft.rows) {
    const level = parseLevelDraft(row.level ?? '')
    if (level === undefined) continue

    for (const [columnKey, cell] of Object.entries(row.cells)) {
      const semanticKey = semanticByKey.get(columnKey) as
        | SpellcastingProgressionColumnKey
        | undefined
      if (!semanticKey) continue
      if (cell === undefined || isTableBuilderCellBlank(cell) || typeof cell !== 'string') continue
      const count = parseCountCell(cell)
      if (count === undefined) continue
      const existing = rowsByColumn.get(semanticKey) ?? []
      existing.push({ level, count })
      rowsByColumn.set(semanticKey, existing)
    }
  }

  const errors: Array<{ path: string; message: string }> = []

  for (const column of fixedColumns) {
    const semanticKey = column.semanticKey as SpellcastingProgressionColumnKey
    const rows = (rowsByColumn.get(semanticKey) ?? []).sort(
      (left, right) => left.level - right.level,
    )
    if (rows.length === 0) {
      errors.push({
        path: 'rows',
        message: classCapacityProgressionValidationMessages.emptyCurve(),
      })
      continue
    }

    for (const issue of collectIncrementIssues(
      rows,
      columnLabelForKey(semanticKey, input.spellSelection),
    )) {
      errors.push({
        path: 'rows',
        message: classCapacityProgressionValidationMessages.countMustIncrease(issue),
      })
    }
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors }
}

export function buildClassSpellcastingProgressionHostConfig(input: {
  allowedLevels: readonly number[]
  extendedProgression?: TableBuilderExtendedProgression
  grantsCantrips: boolean
  spellSelection: ClassSpellSelection | undefined
}): TableBuilderHostConfig {
  return {
    allowedKinds: ['levelProgression'],
    recommendedKind: 'levelProgression',
    allowedLevels: input.allowedLevels,
    columns: 'fixed',
    rows: 'editable',
    resolveFixedColumns: () =>
      resolveSpellcastingProgressionFixedColumns({
        grantsCantrips: input.grantsCantrips,
        spellSelection: input.spellSelection,
      }),
    ...(input.extendedProgression ? { extendedProgression: input.extendedProgression } : {}),
    validateDraftBeforeSave: (ctx) =>
      validateClassSpellcastingProgressionDraft(ctx.draft, {
        grantsCantrips: input.grantsCantrips,
        spellSelection: input.spellSelection,
      }),
  }
}

export function buildClassSpellcastingProgressionDraft(
  progression: ClassSpellcastingProgression | undefined,
  input: {
    allowedLevels: readonly number[]
    extendedProgression?: TableBuilderExtendedProgression
    grantsCantrips: boolean
    spellSelection: ClassSpellSelection | undefined
  },
): TableBuilderFormValues {
  const fixedColumns = resolveSpellcastingProgressionFixedColumns({
    grantsCantrips: input.grantsCantrips,
    spellSelection: input.spellSelection,
  })
  const columnKeys = fixedColumns.map(
    (column) => column.semanticKey as SpellcastingProgressionColumnKey,
  )
  const columns = fixedColumns.map((column) => ({
    key: createTableBuilderColumnKey(),
    label: column.label,
    valueType: column.valueType,
    format: column.format ?? ('plain' as const),
  }))

  const mergedRows = mergedRowsFromProgression(progression, columnKeys)
  const rows = mergedRows.map((row) => ({
    level: String(row.level),
    cells: Object.fromEntries(
      columns.map((column, index) => {
        const semanticKey = columnKeys[index]
        const count = semanticKey ? row.counts[semanticKey] : undefined
        return [column.key, count === undefined ? '' : String(count)]
      }),
    ),
  }))

  return {
    kind: 'levelProgression',
    name: 'Spellcasting progression',
    columns,
    rows,
  }
}

// fallow-ignore-next-line complexity
export function mapClassSpellcastingProgressionDraftToProgression(
  draft: TableBuilderFormValues,
  input: {
    grantsCantrips: boolean
    spellSelection: ClassSpellSelection | undefined
  },
): ClassSpellcastingProgression {
  const columnKeys = resolveSpellcastingProgressionFixedColumns(input).map(
    (column) => column.semanticKey as SpellcastingProgressionColumnKey,
  )
  const semanticByKey = new Map<string, SpellcastingProgressionColumnKey>()
  for (const [index, column] of draft.columns.entries()) {
    const semanticKey = columnKeys[index]
    if (semanticKey) semanticByKey.set(column.key, semanticKey)
  }

  const rowsByColumn = new Map<
    SpellcastingProgressionColumnKey,
    { level: number; count: number }[]
  >()
  for (const row of draft.rows) {
    const level = parseLevelDraft(row.level ?? '')
    if (level === undefined) continue
    for (const [columnKey, cell] of Object.entries(row.cells)) {
      const semanticKey = semanticByKey.get(columnKey)
      if (!semanticKey) continue
      if (cell === undefined || isTableBuilderCellBlank(cell) || typeof cell !== 'string') continue
      const count = parseCountCell(cell)
      if (count === undefined) continue
      const existing = rowsByColumn.get(semanticKey) ?? []
      existing.push({ level, count })
      rowsByColumn.set(semanticKey, existing)
    }
  }

  const progression: ClassSpellcastingProgression = {}
  for (const key of columnKeys) {
    const rows = (rowsByColumn.get(key) ?? []).sort((left, right) => left.level - right.level)
    if (rows.length === 0) continue
    progression[key] = { curve: { rows }, extension: 'carryForward' }
  }
  return progression
}

export function formatClassSpellcastingProgressionMetadata(input: {
  progression: ClassSpellcastingProgression | undefined
  grantsCantrips: boolean
  spellSelection: ClassSpellSelection | undefined
}): string {
  const columnCount = resolveSpellcastingProgressionFixedColumns(input).length
  const columnKeys = resolveSpellcastingProgressionFixedColumns(input).map(
    (column) => column.semanticKey as SpellcastingProgressionColumnKey,
  )
  const changeLevels = mergedRowsFromProgression(input.progression, columnKeys).length
  const columnLabel = columnCount === 1 ? 'column' : 'columns'
  const levelLabel = changeLevels === 1 ? 'change level' : 'change levels'
  return `${columnCount} ${columnLabel} · ${changeLevels} ${levelLabel}`
}
