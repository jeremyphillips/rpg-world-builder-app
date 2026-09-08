import { describe, expect, it } from 'vitest'
import { isContainer } from '@rpg/ui/form'

import { proficienciesFields } from './class-proficiencies-form-fields'

describe('proficienciesFields', () => {
  it('keeps armor chips as a sibling field inside Defenses', () => {
    const defenses = proficienciesFields({ options: {} })[0]
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
