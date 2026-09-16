import { describe, expect, it } from 'vitest'

import type { FieldConfig } from '../field-config'
import { resolveFieldCopyContext } from './field-copy-context.lib'

describe('resolveFieldCopyContext', () => {
  it('maps select fields to the choice category', () => {
    const field: FieldConfig = {
      type: 'select',
      name: 'rarity',
      label: 'Rarity',
      options: [],
    }

    expect(resolveFieldCopyContext(field)).toMatchObject({
      category: 'choice',
      label: 'Rarity',
      noun: { singular: 'rarity', plural: 'rarity' },
    })
  })

  it('maps number fields to the number category', () => {
    const field: FieldConfig = {
      type: 'number',
      name: 'level',
      label: 'Level',
      min: 1,
      max: 20,
    }

    expect(resolveFieldCopyContext(field)).toMatchObject({
      category: 'number',
      min: 1,
      max: 20,
    })
  })

  it('uses explicit noun metadata and chips bounds', () => {
    const field: FieldConfig = {
      type: 'chips',
      name: 'primaryAbilities',
      label: 'Primary abilities',
      options: [],
      min: 1,
      max: 2,
      noun: {
        singular: 'primary ability',
        plural: 'primary abilities',
      },
    }

    expect(resolveFieldCopyContext(field)).toMatchObject({
      category: 'multi',
      min: 1,
      max: 2,
      noun: {
        singular: 'primary ability',
        plural: 'primary abilities',
      },
    })
  })

  it('flips vocabulary when a number field becomes a select', () => {
    const numberField: FieldConfig = {
      type: 'number',
      name: 'score',
      label: 'Score',
    }
    const selectField: FieldConfig = {
      type: 'select',
      name: 'score',
      label: 'Score',
      options: [],
    }

    expect(resolveFieldCopyContext(numberField).category).toBe('number')
    expect(resolveFieldCopyContext(selectField).category).toBe('choice')
  })
})
