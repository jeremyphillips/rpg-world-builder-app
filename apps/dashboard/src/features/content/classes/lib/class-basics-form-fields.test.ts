import { describe, expect, it } from 'vitest'

import { coreAttributesFields } from './class-basics-form-fields'

describe('coreAttributesFields', () => {
  it('authors Basics as a two-column layout with description on the left', () => {
    const [columns] = coreAttributesFields()
    expect(columns && 'kind' in columns && columns.kind === 'columns').toBe(true)
    if (!columns || !('kind' in columns) || columns.kind !== 'columns') return

    expect(columns.columns).toHaveLength(2)
    expect(columns.collapseOrder).toBeUndefined()

    const [left, right] = columns.columns
    expect(left?.fields.map((field) => ('name' in field ? field.name : undefined))).toEqual([
      'description',
      'primaryAbilities',
      'hitDie',
    ])
    const hitDie = left?.fields[2]
    expect(hitDie).toMatchObject({ type: 'chips', name: 'hitDie', multiple: false, required: true })
    expect(right?.fields).toHaveLength(1)
    const slot = right?.fields[0]
    expect(slot).toMatchObject({
      kind: 'slot',
      name: 'characterCreation.abilityScoreOrder',
    })
  })
})
