import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL } from '../../components/equipment/equipment-picker-drawer.types'
import {
  createEquipmentStepContextFixture,
  equipmentStepBardClassFixture,
  equipmentStepBattleaxeFixture,
  equipmentStepDaggerFixture,
} from '../../lib/equipment/equipment-step.fixtures'
import {
  projectWeaponRequirementPreview,
  QUICK_NPC_REQUIREMENT_CALLOUT_CONTEXT,
} from './quick-npc-requirement-preview.lib'
import {
  resolveQuickNpcRequirementValidIds,
  resolveQuickNpcWeaponRequirementOptions,
} from './quick-npc-requirement-options.lib'
import { getEquipmentPickerCallout } from '../../components/equipment/equipment-picker-callout.lib'

const setup = {
  speciesId: 'species-1',
  classId: equipmentStepBardClassFixture.id,
  level: 1,
}

describe('quick-npc-requirement-options.lib', () => {
  it('offers campaign-available weapons rather than package-reachable only', () => {
    const context = createEquipmentStepContextFixture()
    const options = resolveQuickNpcWeaponRequirementOptions({ setup, context })
    const ids = options.map((entry) => entry.option.value)

    expect(ids).toContain(equipmentStepBattleaxeFixture.id)
    expect(ids).toContain(equipmentStepDaggerFixture.id)
  })

  it('excludes campaign-blocked weapons for PC viewers', () => {
    const campaignBlockedBattleaxe = {
      ...equipmentStepBattleaxeFixture,
      campaignAccess: {
        available: true,
        visibilityMode: 'dm_only' as const,
        participantIds: [],
        unavailableParticipantIds: [],
        effectiveAudience: 'dm_only' as const,
      },
    }
    const context = createEquipmentStepContextFixture({
      playActor: { kind: 'pc', characterId: 'pc-1' },
      catalog: {
        ...createEquipmentStepContextFixture().catalog,
        equipment: [equipmentStepDaggerFixture, campaignBlockedBattleaxe],
      },
    })

    const options = resolveQuickNpcWeaponRequirementOptions({ setup, context })
    expect(options.map((entry) => entry.option.value)).toEqual([equipmentStepDaggerFixture.id])
  })

  it('keeps unaffordable campaign-available weapons selectable without purchase callouts', () => {
    const context = createEquipmentStepContextFixture()
    const options = resolveQuickNpcWeaponRequirementOptions({ setup, context })
    const battleaxe = options.find(
      (entry) => entry.option.value === equipmentStepBattleaxeFixture.id,
    )
    expect(battleaxe).toBeDefined()

    const unaffordableItem = {
      ...battleaxe!.pickerItem,
      state: {
        ...battleaxe!.pickerItem.state,
        purchaseAvailability: { status: 'unaffordable' as const, shortfallCp: 10_000 },
        isWithinRemainingBudget: false,
      },
    }

    const projection = projectWeaponRequirementPreview({
      ...battleaxe!,
      pickerItem: unaffordableItem,
    })
    const callout = getEquipmentPickerCallout(
      unaffordableItem,
      QUICK_NPC_REQUIREMENT_CALLOUT_CONTEXT,
    )

    expect(callout?.label).not.toBe(EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL)
    expect(projection.callout?.label).not.toBe(EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL)
  })

  it('derives sync valid ids from the same weapon option resolver', () => {
    const context = createEquipmentStepContextFixture()
    const options = resolveQuickNpcWeaponRequirementOptions({ setup, context })
    const validIds = resolveQuickNpcRequirementValidIds({ setup, context })

    expect(validIds.weaponIds).toEqual(new Set(options.map((entry) => entry.option.value)))
  })

  it('does not delegate weapon picker membership to starting-equipment reachability', () => {
    const source = readFileSync(
      fileURLToPath(new URL('./quick-npc-requirement-options.lib.ts', import.meta.url)),
      'utf8',
    )

    expect(source).not.toContain('listReachableStartingWeapons')
  })
})
