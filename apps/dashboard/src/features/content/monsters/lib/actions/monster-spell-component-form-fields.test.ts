import { describe, expect, it } from 'vitest'

import { monsterSpellComponentRequirementsField } from './monster-spell-component-form-fields'

describe('monsterSpellComponentRequirementsField', () => {
  it('binds the omittedComponents slot', () => {
    expect(monsterSpellComponentRequirementsField()).toMatchObject({
      kind: 'slot',
      name: 'omittedComponents',
    })
    expect(monsterSpellComponentRequirementsField('actions.0.omittedComponents')).toMatchObject({
      name: 'actions.0.omittedComponents',
    })
  })
})
