import { describe, expect, it } from 'vitest'
import { getProficiencyDomainSentenceForm } from '@rpg/contracts'
import { isContainer, type FormItem } from '@rpg/ui/form'

import { proficienciesFields } from './class-proficiencies-form-fields'

function proficienciesColumns(fields: FormItem[] = proficienciesFields({ options: {} })) {
  const [columns] = fields
  if (!columns || !isContainer(columns) || columns.kind !== 'columns') {
    throw new Error('Expected proficiencies columns layout')
  }
  return columns
}

describe('proficienciesFields', () => {
  it('authors Defenses and granted skills on the left, Weapons and tools on the right', () => {
    const columns = proficienciesColumns()
    expect(columns.collapseOrder).toBe('interleave')
    expect(columns.columns).toHaveLength(2)

    const [left, right] = columns.columns
    expect(left?.fields.map((field) => ('legend' in field ? field.legend : undefined))).toEqual([
      'Defenses',
      `Granted ${getProficiencyDomainSentenceForm('skill', 2)}`,
    ])
    expect(right?.fields.map((field) => ('legend' in field ? field.legend : undefined))).toEqual([
      'Weapons',
      `Granted ${getProficiencyDomainSentenceForm('tool', 2)}`,
    ])
  })

  it('keeps armor chips as a sibling field inside Defenses', () => {
    const defenses = proficienciesColumns().columns[0]?.fields[0]
    if (!defenses || !isContainer(defenses) || defenses.kind !== 'group') {
      throw new Error('Expected Defenses group')
    }

    const armorChips = defenses.fields[1]
    expect(armorChips).toMatchObject({
      type: 'chips',
      name: 'proficiencies.armor',
      label: 'Armor training',
    })
    expect(armorChips).not.toHaveProperty('chrome')
  })

  it('gives granted tools its own group with category and item fields', () => {
    const toolsGroup = proficienciesColumns().columns[1]?.fields[1]
    if (!toolsGroup || !isContainer(toolsGroup) || toolsGroup.kind !== 'group') {
      throw new Error('Expected granted tools group')
    }

    expect(toolsGroup).toMatchObject({
      kind: 'group',
      legend: `Granted ${getProficiencyDomainSentenceForm('tool', 2)}`,
    })
    expect(toolsGroup).not.toHaveProperty('fieldChrome')
    expect(toolsGroup.fields.map((field) => ('name' in field ? field.name : undefined))).toEqual([
      'proficiencies.tools.categories',
      'proficiencies.tools.items',
    ])
  })
})
