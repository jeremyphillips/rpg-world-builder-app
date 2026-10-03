import { describe, expect, it } from 'vitest'

import type { CharacterBuildAdvisory } from '@rpg/contracts'

import {
  buildAdvisoryStatusItems,
  indexBuildAdvisoriesByEquipmentId,
  lookupBuildAdvisoriesForEquipment,
  presentBuildAdvisoryList,
} from './build-advisory-presentation.lib'

function notProficient(
  slug: string,
  label: string,
  equipmentClass: 'weapon' | 'armor' | 'shield',
): CharacterBuildAdvisory {
  return {
    code: 'equipment_not_proficient',
    subject: { kind: 'equipment', equipmentId: `srd-cc-5.2.1:${slug}`, label, equipmentClass },
  }
}

const advisories = [
  notProficient('chain-mail', 'Chain Mail', 'armor'),
  notProficient('greatsword', 'Greatsword', 'weapon'),
]

describe('build advisory presentation', () => {
  it('indexes advisories by equipment id and tolerates slug lookups', () => {
    const index = indexBuildAdvisoriesByEquipmentId(advisories)
    expect(lookupBuildAdvisoriesForEquipment(index, 'srd-cc-5.2.1:greatsword')).toHaveLength(1)
    expect(lookupBuildAdvisoriesForEquipment(index, 'greatsword', 'srd-cc-5.2.1')).toHaveLength(1)
    expect(lookupBuildAdvisoriesForEquipment(index, 'srd-cc-5.2.1:dagger')).toEqual([])
  })

  it('maps advisories to warning status items with derived messages', () => {
    expect(buildAdvisoryStatusItems([advisories[1]!])).toEqual([
      { kind: 'text', variant: 'warning', label: 'Not proficient with this weapon' },
    ])
  })

  it('preserves resolver ordering in list items', () => {
    expect(presentBuildAdvisoryList(advisories).map((item) => item.title)).toEqual([
      'Chain Mail',
      'Greatsword',
    ])
  })
})
