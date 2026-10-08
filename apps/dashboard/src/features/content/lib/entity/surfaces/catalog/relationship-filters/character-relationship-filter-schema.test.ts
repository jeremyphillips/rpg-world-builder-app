import { applyFilterSchema, countModifiedFilters, setFilterValue } from '@rpg/ui/filters'
import { describe, expect, it } from 'vitest'

import {
  createCharacterRelationshipFilterSchema,
  resolveCharacterRelationshipFilterLayout,
} from './character-relationship-filter-schema'

type CharacterRow = {
  id: string
  characterType: 'pc' | 'npc'
  classIds: readonly string[]
}

const rows: CharacterRow[] = [
  { id: 'aria', characterType: 'pc', classIds: ['fighter', 'rogue'] },
  { id: 'darius', characterType: 'npc', classIds: ['wizard'] },
  { id: 'bryn', characterType: 'npc', classIds: ['fighter'] },
]

function createSchema(nextRows: readonly CharacterRow[] = rows) {
  return createCharacterRelationshipFilterSchema({
    rows: nextRows,
    getCharacterType: (row) => row.characterType,
    getClassIds: (row) => row.classIds,
    resolveClassLabel: (classId) => (classId === 'fighter' ? 'Fighter' : classId),
  })
}

describe('createCharacterRelationshipFilterSchema', () => {
  it('offers All plus the types and classes present on the rows', () => {
    const schema = createSchema()
    const typeField = schema.fields.find((field) => field.id === 'characterType')
    const classField = schema.fields.find((field) => field.id === 'classId')

    expect(typeField?.type).toBe('chips')
    expect(classField?.type).toBe('select')
    if (typeField?.type !== 'chips' || classField?.type !== 'select') return

    expect(typeField.options).toEqual([
      { value: 'all', label: 'All' },
      { value: 'pc', label: 'PC' },
      { value: 'npc', label: 'NPC' },
    ])
    expect(classField.options).toEqual([
      { value: 'fighter', label: 'Fighter' },
      { value: 'rogue', label: 'rogue' },
      { value: 'wizard', label: 'wizard' },
    ])
    expect(resolveCharacterRelationshipFilterLayout(schema)).toEqual({
      primaryFieldIds: ['characterType'],
      filterRowFieldIds: ['classId'],
    })
  })

  it('hides a control that would have a single real option', () => {
    const schema = createSchema([
      { id: 'aria', characterType: 'pc', classIds: ['fighter'] },
      { id: 'bryn', characterType: 'pc', classIds: ['fighter'] },
    ])

    expect(schema.fields).toEqual([])
    expect(resolveCharacterRelationshipFilterLayout(schema)).toEqual({
      primaryFieldIds: [],
      filterRowFieldIds: [],
    })
  })

  it('matches a character when any class id is selected', () => {
    const schema = createSchema()
    const selected = setFilterValue(schema, {}, 'classId', 'fighter')

    expect(applyFilterSchema(schema, selected, [...rows]).map((row) => row.id)).toEqual([
      'aria',
      'bryn',
    ])
    expect(countModifiedFilters(schema, selected)).toBe(1)
    expect(countModifiedFilters(schema, {})).toBe(0)
  })

  it('matches character type independently of class', () => {
    const schema = createSchema()
    const selected = setFilterValue(schema, {}, 'characterType', 'npc')

    expect(applyFilterSchema(schema, selected, [...rows]).map((row) => row.id)).toEqual([
      'darius',
      'bryn',
    ])
  })
})
