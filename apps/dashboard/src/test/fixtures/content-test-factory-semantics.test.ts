import { describe, expect, it } from 'vitest'

import { makeCharacterClass } from './factories/character-class'
import { makeEquipment } from './factories/equipment'
import { makeSpecies } from './factories/species'
import { pickClass, pickEquipment, pickSpecies } from './pick'

describe('content test factory pick/make semantics', () => {
  it('throws when pickX is called with an unknown slug', () => {
    expect(() => pickClass('not-a-real-class')).toThrow()
    expect(() => pickSpecies('not-a-real-species')).toThrow()
    expect(() => pickEquipment('not-a-real-item')).toThrow()
  })

  it('makeX builds synthetic entities with test-owned identity', () => {
    const custom = makeCharacterClass({ slug: 'not-a-real-class', name: 'Test Class' })

    expect(custom.slug).toBe('not-a-real-class')
    expect(custom.name).toBe('Test Class')
  })

  it('makeX does not inherit catalog semantics from a matching slug', () => {
    expect(makeCharacterClass({ slug: 'fighter' })).not.toEqual(pickClass('fighter'))
    expect(makeSpecies({ slug: 'dwarf' })).not.toEqual(pickSpecies('dwarf'))
    expect(makeEquipment({ kind: 'weapon', slug: 'longsword' })).not.toEqual(
      pickEquipment('longsword'),
    )
  })
})
