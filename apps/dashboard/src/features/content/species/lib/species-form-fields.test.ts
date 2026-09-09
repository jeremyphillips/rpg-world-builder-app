import { describe, expect, it } from 'vitest'
import {
  CREATURE_SIZE_TERM,
  CREATURE_TYPE_TERM,
  getVocabularyTermLabel,
  vocabularyTermFieldCopy,
} from '@rpg/contracts'
import { isContainer, resolveColumnsCollapseSequence, type FormItem } from '@rpg/ui/form'

import { buildSpeciesTabs } from './species-form-fields'

function speciesBasicsColumns(fields?: FormItem[]) {
  const basics = buildSpeciesTabs({}).find((tab) => tab.id === 'basics')
  const [columns] = fields ?? basics?.fields ?? []
  if (!columns || !isContainer(columns) || columns.kind !== 'columns') {
    throw new Error('Expected species Basics columns layout')
  }
  return columns
}

function columnItemKey(field: FormItem): string | undefined {
  if ('name' in field) return field.name
  if ('legend' in field) return field.legend
  return undefined
}

describe('buildSpeciesTabs basics', () => {
  it('authors Creature type, Movement, and Culture on the left and Size plus Description on the right', () => {
    const columns = speciesBasicsColumns()
    const [left, right] = columns.columns

    expect(left?.fields.map(columnItemKey)).toEqual(['creatureType', 'movement', 'Culture'])
    expect(right?.fields.map(columnItemKey)).toEqual(['sizes', 'description'])
    expect(right?.fields[0]).toMatchObject({
      type: 'chips',
      name: 'sizes',
      label: getVocabularyTermLabel(CREATURE_SIZE_TERM),
    })
    expect(left?.fields[0]).toMatchObject({
      name: 'creatureType',
      label: vocabularyTermFieldCopy(CREATURE_TYPE_TERM).label,
    })
  })

  it('stacks fields in the existing Basics order', () => {
    const columns = speciesBasicsColumns()
    expect(
      resolveColumnsCollapseSequence(columns.columns, columns.collapseOrder).map(columnItemKey),
    ).toEqual(['creatureType', 'sizes', 'movement', 'Culture', 'description'])
  })
})
