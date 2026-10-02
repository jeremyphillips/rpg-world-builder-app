import { describe, expect, it } from 'vitest'

import { indexCharacterBuildCatalog, type CharacterBuildContext } from '@rpg/contracts'

import {
  equipmentStepContextFixture,
  equipmentStepRationsFixture,
  equipmentStepSpearFixture,
} from '@/features/character/lib/equipment/equipment-step.fixtures'

import { projectQuickNpcEquipmentAllocations } from './quick-npc-equipment-supply.lib'

const catalogIndex = indexCharacterBuildCatalog(
  (equipmentStepContextFixture as CharacterBuildContext).catalog,
)

describe('projectQuickNpcEquipmentAllocations', () => {
  it('sums classless origins and dedupes classed weapons while keeping nonweapon quantity', () => {
    expect(
      projectQuickNpcEquipmentAllocations({
        catalogIndex,
        classed: false,
        equipmentSelections: [
          { equipmentId: equipmentStepRationsFixture.id, quantity: 1, origin: 'role-default' },
          { equipmentId: equipmentStepRationsFixture.id, quantity: 2, origin: 'manual' },
        ],
      }).startingEquipmentGrants,
    ).toEqual([{ equipmentId: equipmentStepRationsFixture.id, quantity: 3 }])

    const classed = projectQuickNpcEquipmentAllocations({
      catalogIndex,
      classed: true,
      equipmentSelections: [
        { equipmentId: equipmentStepSpearFixture.id, quantity: 1, origin: 'manual' },
        { equipmentId: equipmentStepSpearFixture.id, quantity: 1, origin: 'manual' },
        { equipmentId: equipmentStepRationsFixture.id, quantity: 4, origin: 'manual' },
      ],
    })
    expect(classed.requiredWeaponIds).toEqual([equipmentStepSpearFixture.id])
    expect(classed.manualEquipmentGrantIds).toEqual([])
    expect(classed.startingEquipmentGrants).toEqual([
      { equipmentId: equipmentStepRationsFixture.id, quantity: 4 },
    ])
  })
})
