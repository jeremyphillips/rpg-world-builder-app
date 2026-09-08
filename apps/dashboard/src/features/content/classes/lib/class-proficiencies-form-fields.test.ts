import { describe, expect, it } from 'vitest'
import { isContainer, type GroupConfig } from '@rpg/ui/form'

import { proficienciesFields } from './class-proficiencies-form-fields'

describe('proficienciesFields', () => {
  it('wraps armor chips in an anonymous layout group without group chrome', () => {
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
    })
    expect(armorGroup).not.toHaveProperty('legend')
    expect(armorGroup).not.toHaveProperty('heading')
    expect(armorGroup).not.toHaveProperty('chrome')

    const armorChips = (armorGroup as GroupConfig).fields[0]
    expect(armorChips).toMatchObject({
      type: 'chips',
      name: 'proficiencies.armor',
      label: 'Armor training',
    })
    expect(armorChips).not.toHaveProperty('chrome')
  })

  it('keeps the nested Tools group as a named subsection without fieldChrome override', () => {
    const skillsAndTools = proficienciesFields({ options: {} })[2]
    if (!skillsAndTools || !isContainer(skillsAndTools) || skillsAndTools.kind !== 'group') {
      throw new Error('Expected skills & tools group')
    }

    const toolsGroup = skillsAndTools.fields[1]
    expect(toolsGroup).toMatchObject({
      kind: 'group',
      legend: 'Tools',
    })
    expect(toolsGroup).not.toHaveProperty('fieldChrome')
  })
})
