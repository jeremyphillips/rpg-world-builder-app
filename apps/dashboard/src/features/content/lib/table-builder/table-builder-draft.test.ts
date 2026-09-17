import { progressionTableSchema, type ProgressionTable } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { isTableGridDataRow } from '../../components/tables/table-grid-presentation'
import {
  createEmptyTableBuilderDraft,
  progressionDraftToGridPresentation,
  draftToTable,
  hasMeaningfulTableBuilderDraftContent,
  isTableBuilderCellBlank,
  parseDiceCellDraft,
  parseLevelDraft,
  parseNumberCellDraft,
  removeTableBuilderColumnAt,
  resetTableBuilderDraftForKindChange,
  resolveTableBuilderColumnDeleteIntent,
  resolveRowSortMove,
  tableToDraft,
  type TableBuilderFormValues,
} from './table-builder-draft'
import { resolveNextUnusedLevel } from './resolve-next-unused-level'

const rageTable: ProgressionTable = {
  id: 'rage-progression',
  name: 'Rage progression',
  kind: 'levelProgression',
  columns: [
    {
      id: 'uses',
      label: 'Rages',
      valueType: 'number',
      entries: [
        { level: 1, value: 2 },
        { level: 3, value: 3 },
        { level: 6, value: 4 },
      ],
    },
    {
      id: 'damage-bonus',
      label: 'Rage Damage',
      valueType: 'number',
      format: 'signed',
      entries: [
        { level: 1, value: 2 },
        { level: 9, value: 3 },
      ],
    },
  ],
}

const martialArtsTable: ProgressionTable = {
  id: 'martial-arts-progression',
  name: 'Martial Arts progression',
  kind: 'levelProgression',
  columns: [
    {
      id: 'die',
      label: 'Martial Arts',
      valueType: 'dice',
      entries: [
        { level: 1, value: { count: 1, faces: 6 } },
        { level: 5, value: { count: 1, faces: 8 } },
      ],
    },
  ],
}

describe('tableToDraft', () => {
  it('produces sparse rows at the breakpoint union', () => {
    const draft = tableToDraft(rageTable)

    expect(draft.name).toBe('Rage progression')
    expect(draft.rows.map((row) => row.level)).toEqual(['1', '3', '6', '9'])

    const [usesColumn, damageColumn] = draft.columns
    expect(usesColumn?.id).toBe('uses')
    expect(damageColumn?.format).toBe('signed')

    const rowAt3 = draft.rows[1]
    expect(rowAt3?.cells[usesColumn!.key]).toBe('3')
    // Sparse: Rage Damage has no breakpoint at level 3 — blank cell, not a copy.
    expect(rowAt3?.cells[damageColumn!.key]).toBeUndefined()
  })

  it('maps dice entries to count/faces drafts', () => {
    const draft = tableToDraft(martialArtsTable)
    const dieColumn = draft.columns[0]

    expect(draft.rows[0]?.cells[dieColumn!.key]).toEqual({ count: '1', faces: '6' })
  })
})

describe('draftToTable', () => {
  it('round-trips a persisted table unchanged', () => {
    for (const table of [rageTable, martialArtsTable]) {
      const roundTripped = draftToTable(tableToDraft(table), { existingTable: table })
      expect(roundTripped).toEqual(table)
      expect(progressionTableSchema.parse(roundTripped)).toEqual(table)
    }
  })

  it('does not fabricate carry-forward entries for blank cells', () => {
    const draft = tableToDraft(rageTable)
    const table = draftToTable(draft, { existingTable: rageTable })
    const damage = table.columns.find((column) => column.id === 'damage-bonus')

    expect(damage?.entries).toEqual([
      { level: 1, value: 2 },
      { level: 9, value: 3 },
    ])
  })

  it('derives stable ids for new columns and dedupes within the table', () => {
    const draft: TableBuilderFormValues = {
      kind: 'levelProgression',
      name: 'New table',
      columns: [
        { key: 'a', label: 'Uses', valueType: 'number', format: 'plain' },
        { key: 'b', label: 'Uses', valueType: 'text', format: 'plain' },
      ],
      rows: [{ level: '1', cells: { a: '2', b: 'Special' } }],
    }

    const table = draftToTable(draft)

    expect(table.id).toBe('new-table')
    expect(table.columns.map((column) => column.id)).toEqual(['uses', 'uses-2'])
  })

  it('keeps existing column ids stable across label renames', () => {
    const draft = tableToDraft(rageTable)
    draft.columns[0]!.label = 'Rage Uses'

    const table = draftToTable(draft, { existingTable: rageTable })

    expect(table.columns[0]?.id).toBe('uses')
    expect(table.columns[0]?.label).toBe('Rage Uses')
  })

  it('omits plain number format and preserves signed', () => {
    const draft = tableToDraft(rageTable)
    const table = draftToTable(draft, { existingTable: rageTable })

    expect(table.columns[0]).not.toHaveProperty('format')
    expect(table.columns[1]?.valueType === 'number' && table.columns[1].format).toBe('signed')
  })

  it('sorts entries ascending regardless of row order', () => {
    const draft: TableBuilderFormValues = {
      kind: 'levelProgression',
      name: 'Out of order',
      columns: [{ key: 'a', label: 'Uses', valueType: 'number', format: 'plain' }],
      rows: [
        { level: '9', cells: { a: '4' } },
        { level: '1', cells: { a: '2' } },
      ],
    }

    const table = draftToTable(draft)
    expect(table.columns[0]?.entries.map((entry) => entry.level)).toEqual([1, 9])
  })
})

describe('progressionDraftToGridPresentation', () => {
  it('resolves carry-forward values for the preview', () => {
    const draft = tableToDraft(rageTable)
    const presentation = progressionDraftToGridPresentation(draft)

    const damageKey = draft.columns[1]!.key
    const usesKey = draft.columns[0]!.key

    // Author: level 9 | blank | +3 — preview resolves the blank to the carried 4.
    const rowAt9 = presentation.rows.filter(isTableGridDataRow).find((row) => row.rowHeader === 9)
    expect(rowAt9?.cells[usesKey]).toBe('4')
    expect(rowAt9?.cells[damageKey]).toBe('+3')
  })

  it('formats dice and signed values through the display SSOT', () => {
    const draft = tableToDraft(martialArtsTable)
    const presentation = progressionDraftToGridPresentation(draft)

    const secondRow = presentation.rows.filter(isTableGridDataRow)[1]
    expect(secondRow?.cells[draft.columns[0]!.key]).toBe('1d8')
  })

  it('tolerates incomplete drafts without claiming validity', () => {
    const presentation = progressionDraftToGridPresentation({
      kind: 'levelProgression',
      name: '',
      columns: [
        { key: 'a', label: '', valueType: 'number', format: 'plain' },
        { key: 'b', label: 'Uses', valueType: 'number', format: 'plain' },
      ],
      rows: [
        { level: '', cells: { b: '2' } },
        { level: '3', cells: { a: 'not-a-number' } },
      ],
    })

    expect(presentation.name).toBeUndefined()
    // Unnamed columns fall back to a positional label — never the ephemeral key.
    expect(presentation.columns[0]?.label).toBe('Column 1')

    const dataRows = presentation.rows.filter(isTableGridDataRow)
    const leveled = dataRows.find((row) => row.rowHeader === 3)
    expect(leveled?.cells.a).toBeUndefined()

    const unleveled = dataRows.find((row) => row.rowHeader === undefined)
    expect(unleveled?.cells.b).toBe('2')
  })

  it('sorts leveled rows ascending and appends unleveled rows', () => {
    const presentation = progressionDraftToGridPresentation({
      kind: 'levelProgression',
      name: 'Sorting',
      columns: [{ key: 'a', label: 'Uses', valueType: 'number', format: 'plain' }],
      rows: [
        { level: '9', cells: { a: '3' } },
        { level: '', cells: {} },
        { level: '1', cells: { a: '2' } },
      ],
    })

    expect(
      presentation.rows.map((row) => (isTableGridDataRow(row) ? row.rowHeader : row.kind)),
    ).toEqual([1, 9, undefined])
  })

  it('returns empty presentation for the empty draft', () => {
    const presentation = progressionDraftToGridPresentation(createEmptyTableBuilderDraft())
    expect(presentation.columns).toEqual([])
    expect(presentation.rows).toEqual([])
  })
})

describe('cell parsing', () => {
  it('parses number drafts', () => {
    expect(parseNumberCellDraft(' 4 ')).toBe(4)
    expect(parseNumberCellDraft('-1')).toBe(-1)
    expect(parseNumberCellDraft('')).toBeUndefined()
    expect(parseNumberCellDraft('abc')).toBeUndefined()
  })

  it('parses dice drafts against the die-face vocabulary', () => {
    expect(parseDiceCellDraft({ count: '2', faces: '8' })).toEqual({ count: 2, faces: 8 })
    expect(parseDiceCellDraft({ count: '0', faces: '8' })).toBeUndefined()
    expect(parseDiceCellDraft({ count: '1', faces: '7' })).toBeUndefined()
    expect(parseDiceCellDraft({ count: '', faces: '' })).toBeUndefined()
  })

  it('parses level drafts', () => {
    expect(parseLevelDraft('12')).toBe(12)
    expect(parseLevelDraft('')).toBeUndefined()
    expect(parseLevelDraft('0')).toBeUndefined()
    expect(parseLevelDraft('1.5')).toBeUndefined()
  })

  it('treats blank strings and empty dice drafts as blank cells', () => {
    expect(isTableBuilderCellBlank(undefined)).toBe(true)
    expect(isTableBuilderCellBlank('  ')).toBe(true)
    expect(isTableBuilderCellBlank({ count: '', faces: '' })).toBe(true)
    expect(isTableBuilderCellBlank('0')).toBe(false)
    expect(isTableBuilderCellBlank({ count: '1', faces: '' })).toBe(false)
  })
})

describe('resolveNextUnusedLevel', () => {
  const allowed = Array.from({ length: 20 }, (_, index) => index + 1)

  it('prefers the first unused level above the current maximum', () => {
    expect(resolveNextUnusedLevel([1, 3, 6], allowed)).toBe(7)
  })

  it('falls back to the lowest unused gap when the maximum is exhausted', () => {
    expect(resolveNextUnusedLevel([1, 5, 20], allowed)).toBe(2)
  })

  it('returns the lowest allowed level for an empty table', () => {
    expect(resolveNextUnusedLevel([], allowed)).toBe(1)
  })

  it('returns undefined only at true exhaustion', () => {
    expect(resolveNextUnusedLevel(allowed, allowed)).toBeUndefined()
  })

  it('supports non-contiguous allowed sets', () => {
    expect(resolveNextUnusedLevel([5], [5, 10, 15])).toBe(10)
    expect(resolveNextUnusedLevel([10, 15], [5, 10, 15])).toBe(5)
  })
})

describe('resetTableBuilderDraftForKindChange', () => {
  it('preserves the name and resets kind-specific structure', () => {
    const draft: TableBuilderFormValues = {
      kind: 'levelProgression',
      name: 'Rage',
      columns: [{ key: 'c1', label: 'Uses', valueType: 'number', format: 'plain' }],
      rows: [{ level: '1', cells: { c1: '2' } }],
    }

    expect(resetTableBuilderDraftForKindChange(draft, 'general')).toEqual({
      kind: 'general',
      name: 'Rage',
      columns: [],
      rows: [],
    })
  })
})

describe('resolveTableBuilderColumnDeleteIntent', () => {
  it('requires confirmation for populated columns', () => {
    const draft: TableBuilderFormValues = {
      kind: 'general',
      name: 'Test',
      columns: [
        { key: 'c1', label: 'A', valueType: 'text', format: 'plain' },
        { key: 'c2', label: 'B', valueType: 'text', format: 'plain' },
      ],
      rows: [{ key: 'r1', cells: { c1: 'Elf', c2: '' } }],
    }

    expect(resolveTableBuilderColumnDeleteIntent(draft, 0)).toEqual({
      action: 'confirm',
      reason: 'populated',
    })
  })

  it('requires confirmation when deleting the last column with rows', () => {
    const draft: TableBuilderFormValues = {
      kind: 'levelProgression',
      name: 'Test',
      columns: [{ key: 'c1', label: 'Uses', valueType: 'number', format: 'plain' }],
      rows: [{ level: '1', cells: {} }],
    }

    expect(resolveTableBuilderColumnDeleteIntent(draft, 0)).toEqual({
      action: 'confirm',
      reason: 'lastColumnWithRows',
    })
  })

  it('deletes empty non-final columns immediately', () => {
    const draft: TableBuilderFormValues = {
      kind: 'general',
      name: 'Test',
      columns: [
        { key: 'c1', label: 'A', valueType: 'text', format: 'plain' },
        { key: 'c2', label: 'B', valueType: 'text', format: 'plain' },
      ],
      rows: [],
    }

    expect(resolveTableBuilderColumnDeleteIntent(draft, 0)).toEqual({ action: 'immediate' })
  })
})

describe('removeTableBuilderColumnAt', () => {
  it('scrubs cells and clears rows when removing the last column', () => {
    const draft: TableBuilderFormValues = {
      kind: 'levelProgression',
      name: 'Test',
      columns: [{ key: 'c1', label: 'Uses', valueType: 'number', format: 'plain' }],
      rows: [{ level: '1', cells: { c1: '2' } }],
    }

    expect(removeTableBuilderColumnAt(draft, 0)).toEqual({
      kind: 'levelProgression',
      name: 'Test',
      columns: [],
      rows: [],
    })
  })

  it('preserves unrelated column values when removing a populated column', () => {
    const draft: TableBuilderFormValues = {
      kind: 'general',
      name: 'Test',
      columns: [
        { key: 'c1', label: 'A', valueType: 'text', format: 'plain' },
        { key: 'c2', label: 'B', valueType: 'text', format: 'plain' },
      ],
      rows: [{ key: 'r1', cells: { c1: 'Elf', c2: 'Dwarf' } }],
    }

    expect(removeTableBuilderColumnAt(draft, 0)).toEqual({
      kind: 'general',
      name: 'Test',
      columns: [{ key: 'c2', label: 'B', valueType: 'text', format: 'plain' }],
      rows: [{ key: 'r1', cells: { c2: 'Dwarf' } }],
    })
  })
})

describe('hasMeaningfulTableBuilderDraftContent', () => {
  it('returns false for an empty draft', () => {
    expect(hasMeaningfulTableBuilderDraftContent(createEmptyTableBuilderDraft())).toBe(false)
  })

  it('returns true when columns or rows exist', () => {
    expect(
      hasMeaningfulTableBuilderDraftContent({
        ...createEmptyTableBuilderDraft(),
        columns: [{ key: 'c1', label: '', valueType: 'number', format: 'plain' }],
      }),
    ).toBe(true)

    expect(
      hasMeaningfulTableBuilderDraftContent({
        ...createEmptyTableBuilderDraft('general'),
        rows: [{ key: 'r1', cells: {} }],
      }),
    ).toBe(true)
  })

  it('returns true when a column label or cell value is authored', () => {
    expect(
      hasMeaningfulTableBuilderDraftContent({
        kind: 'levelProgression',
        name: '',
        columns: [{ key: 'c1', label: 'Uses', valueType: 'number', format: 'plain' }],
        rows: [],
      }),
    ).toBe(true)

    expect(
      hasMeaningfulTableBuilderDraftContent({
        kind: 'general',
        name: '',
        columns: [{ key: 'c1', label: '', valueType: 'text', format: 'plain' }],
        rows: [{ key: 'r1', cells: { c1: 'Elf' } }],
      }),
    ).toBe(true)
  })
})

describe('resolveRowSortMove', () => {
  it('moves a changed row to its sorted position', () => {
    expect(resolveRowSortMove([1, 9, 6], 1)).toEqual({ from: 1, to: 2 })
    expect(resolveRowSortMove([6, 1, 9], 0)).toEqual({ from: 0, to: 1 })
  })

  it('returns undefined when already sorted', () => {
    expect(resolveRowSortMove([1, 6, 9], 1)).toBeUndefined()
  })

  it('defers sorting while any level is unset', () => {
    expect(resolveRowSortMove([1, undefined, 9], 2)).toBeUndefined()
    expect(resolveRowSortMove([1, 9, undefined], 1)).toBeUndefined()
  })
})
