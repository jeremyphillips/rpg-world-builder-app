import { describe, expect, it } from 'vitest'
import { formatFieldMessage } from '@rpg/contracts'
import { loadSpellcastingProgressionSeed } from '@rpg/catalog/spellcasting-progressions'

import {
  buildLeveledSlotProgressionDraft,
  buildPactSlotProgressionDraft,
  mapLeveledSlotProgressionDraftToRows,
  resolveLeveledSlotFixedColumns,
  resolvePactSlotFixedColumns,
  validateLeveledSlotProgressionDraft,
  validatePactSlotProgressionDraft,
} from './slot-progression-field.lib'

const FULL_CASTER = loadSpellcastingProgressionSeed('srd-cc-5.2.1').slotProgressions.find(
  (entry) => entry.id === 'full-caster',
)!
const PACT_MAGIC = loadSpellcastingProgressionSeed('srd-cc-5.2.1').slotProgressions.find(
  (entry) => entry.id === 'pact-magic',
)!

describe('resolveLeveledSlotFixedColumns', () => {
  it('derives nine spell slot level columns with semantic keys', () => {
    const columns = resolveLeveledSlotFixedColumns()

    expect(columns).toHaveLength(9)
    expect(columns[0]).toMatchObject({ semanticKey: 'slot-level-1', label: '1st' })
    expect(columns[8]).toMatchObject({ semanticKey: 'slot-level-9', label: '9th' })
  })
})

describe('resolvePactSlotFixedColumns', () => {
  it('derives pact slot count and slot level columns', () => {
    expect(resolvePactSlotFixedColumns()).toEqual([
      expect.objectContaining({ semanticKey: 'pact-slot-count', label: 'Slots' }),
      expect.objectContaining({ semanticKey: 'pact-slot-level', label: 'Slot level' }),
    ])
  })
})

describe('validateLeveledSlotProgressionDraft', () => {
  it('accepts a canonical full-caster seed draft', () => {
    const draft = buildLeveledSlotProgressionDraft({
      label: 'Full caster',
      effectiveMaxLevel: 20,
      seedRows: FULL_CASTER.kind === 'leveled' ? FULL_CASTER.rows : [],
    })

    expect(validateLeveledSlotProgressionDraft(draft)).toEqual({ valid: true })
  })

  it('surfaces exact row and slot column copy for decreasing slot counts', () => {
    const draft = buildLeveledSlotProgressionDraft({
      label: 'Full caster',
      effectiveMaxLevel: 20,
      seedRows: FULL_CASTER.kind === 'leveled' ? FULL_CASTER.rows : [],
    })

    const level8RowIndex = draft.rows.findIndex((row) => row.level === '8')
    const secondSlotColumnKey = draft.columns[1]?.key
    expect(level8RowIndex).toBeGreaterThanOrEqual(0)
    expect(secondSlotColumnKey).toBeDefined()

    draft.rows[level8RowIndex] = {
      ...draft.rows[level8RowIndex]!,
      cells: {
        ...draft.rows[level8RowIndex]!.cells,
        [secondSlotColumnKey!]: '2',
      },
    }

    const result = validateLeveledSlotProgressionDraft(draft)
    expect(result.valid).toBe(false)
    if (result.valid) return

    expect(result.errors[0]?.path).toBe(`rows.${level8RowIndex}.cells.${secondSlotColumnKey}`)
    expect(formatFieldMessage(result.errors[0]!.message)).toBe(
      'Level 8 · 2nd — slot count cannot decrease from 3 to 2.',
    )
  })
})

describe('validatePactSlotProgressionDraft', () => {
  it('accepts a canonical pact magic seed draft', () => {
    const draft = buildPactSlotProgressionDraft({
      label: 'Pact magic',
      effectiveMaxLevel: 20,
      seedRows: PACT_MAGIC.kind === 'pact' ? PACT_MAGIC.rows : [],
    })

    expect(validatePactSlotProgressionDraft(draft)).toEqual({ valid: true })
  })

  it('maps pact slot count decreases to the slot count column', () => {
    const draft = buildPactSlotProgressionDraft({
      label: 'Pact magic',
      effectiveMaxLevel: 20,
      seedRows: PACT_MAGIC.kind === 'pact' ? PACT_MAGIC.rows : [],
    })

    const level17RowIndex = draft.rows.findIndex((row) => row.level === '17')
    expect(level17RowIndex).toBeGreaterThanOrEqual(0)

    draft.rows[level17RowIndex] = {
      ...draft.rows[level17RowIndex]!,
      cells: {
        ...draft.rows[level17RowIndex]!.cells,
        'pact-slot-count': '2',
      },
    }

    const result = validatePactSlotProgressionDraft(draft)
    expect(result.valid).toBe(false)
    if (result.valid) return

    expect(result.errors[0]?.path).toBe(`rows.${level17RowIndex}.cells.pact-slot-count`)
    expect(formatFieldMessage(result.errors[0]!.message)).toBe(
      'Level 17 · pact slots — slot count cannot decrease from 3 to 2.',
    )
  })
})

describe('mapLeveledSlotProgressionDraftToRows', () => {
  it('normalizes trailing zero slot columns on save mapping', () => {
    const draft = buildLeveledSlotProgressionDraft({
      label: 'Full caster',
      effectiveMaxLevel: 3,
      seedRows: [{ level: 1, slots: [2] }],
    })

    const firstSlotKey = draft.columns[0]?.key
    expect(firstSlotKey).toBeDefined()

    draft.rows[0] = {
      ...draft.rows[0]!,
      cells: {
        ...draft.rows[0]!.cells,
        [firstSlotKey!]: '2',
        'slot-level-2': '0',
        'slot-level-3': '0',
      },
    }

    expect(mapLeveledSlotProgressionDraftToRows(draft)[0]).toEqual({ level: 1, slots: [2] })
  })
})
