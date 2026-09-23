import { describe, expect, it } from 'vitest'

import { getPersonConnectionRoleOption } from './connection-role-catalog'
import { buildPersonRelationshipCreateInput } from './connection-create-input.lib'

describe('buildPersonRelationshipCreateInput', () => {
  it('stores parent relationships with the selected character as parent', () => {
    const role = getPersonConnectionRoleOption('parent')
    expect(role).toBeDefined()

    const input = buildPersonRelationshipCreateInput('pc-1', 'npc-1', role!)

    expect(input).toEqual({
      kind: 'parentOf',
      characterId: 'npc-1',
      relatedCharacterId: 'pc-1',
    })
  })

  it('orders symmetric friendships canonically', () => {
    const role = getPersonConnectionRoleOption('friend')
    expect(role).toBeDefined()

    const input = buildPersonRelationshipCreateInput('pc-1', 'npc-1', role!)

    expect(input).toEqual({
      kind: 'friendOf',
      characterId: 'npc-1',
      relatedCharacterId: 'pc-1',
    })
  })
})
