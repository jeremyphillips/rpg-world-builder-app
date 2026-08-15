import { describe, expect, it } from 'vitest'
import { isContainer, type GroupConfig } from '@rpg/ui/form'

import { proficienciesFields } from './class-proficiencies-form-fields'

describe('proficienciesFields', () => {
  it('wraps armor chips in an anonymous inset group without field panel chrome', () => {
    const defenses = proficienciesFields({ options: {} })[0]
    if (!defenses || !isContainer(defenses) || defenses.kind !== 'group') {
      throw new Error('Expected Defenses group')
    }

    const armorGroup = defenses.fields[1]
    if (!armorGroup || !isContainer(armorGroup) || armorGroup.kind !== 'group') {
      throw new Error('Expected anonymous armor group')
    }

    expect(armorGroup).toMatchObject({
      kind: 'group',
      chrome: { variant: 'inset' },
    })
    expect(armorGroup).not.toHaveProperty('legend')
    expect(armorGroup).not.toHaveProperty('heading')

    const armorChips = (armorGroup as GroupConfig).fields[0]
    expect(armorChips).toMatchObject({
      type: 'chips',
      name: 'proficiencies.armor',
      label: 'Armor training',
    })
    expect(armorChips).not.toHaveProperty('chrome')
  })
})
