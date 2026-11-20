import { describe, expect, it } from 'vitest'

import {
  isMultiattackAttackGroup,
  isMultiattackUseClause,
  multiattackDraftStepSchema,
  multiattackPositiveInt,
} from './multiattack-schemas'

describe('multiattack step discrimination', () => {
  it('treats actionId-only rows as use clauses', () => {
    expect(isMultiattackUseClause({ actionId: 'spellcasting', actionIds: [] })).toBe(true)
    expect(isMultiattackAttackGroup({ actionId: 'spellcasting', actionIds: [] })).toBe(false)
  })

  it('keeps empty attack groups out of use clause detection', () => {
    expect(isMultiattackAttackGroup({ actionIds: [] })).toBe(true)
    expect(isMultiattackUseClause({ actionIds: [] })).toBe(false)
  })

  it('parses use rows before attack groups in the draft union', () => {
    const parsed = multiattackDraftStepSchema.parse({
      kind: 'use',
      mode: 'single',
      actionId: 'spellcasting',
      count: 1,
    })
    expect(parsed).toMatchObject({
      kind: 'use',
      actionId: 'spellcasting',
      count: 1,
    })
    expect('actionIds' in parsed).toBe(false)
  })
})

describe('multiattackPositiveInt', () => {
  it('accepts integer numbers and numeric strings', () => {
    expect(multiattackPositiveInt(2)).toBe(2)
    expect(multiattackPositiveInt('3')).toBe(3)
  })

  it('rejects zero, fractions, and empty input', () => {
    expect(multiattackPositiveInt(0)).toBeUndefined()
    expect(multiattackPositiveInt(1.5)).toBeUndefined()
    expect(multiattackPositiveInt('')).toBeUndefined()
    expect(multiattackPositiveInt('x')).toBeUndefined()
  })
})
