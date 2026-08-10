import { describe, expect, it } from 'vitest'

import { equipmentPickerLongswordFixture } from '../../components/equipment/equipment-picker-drawer.fixtures'
import { buildEquipmentPickerRowViewModel } from '@/features/content'

import { projectWeaponRequirementPreview } from './quick-npc-requirement-preview.lib'
import type { QuickNpcWeaponRequirementOption } from './quick-npc-requirement-options.lib'

describe('quick-npc-requirement-preview.lib', () => {
  it('formats equipment metadata lines as readable preview description text', () => {
    const row = buildEquipmentPickerRowViewModel(equipmentPickerLongswordFixture)
    const entry = {
      option: { value: equipmentPickerLongswordFixture.id, label: row.name },
      pickerItem: {
        equipment: equipmentPickerLongswordFixture,
        state: {
          isAvailable: true,
          isRecommended: false,
          isProficient: true,
          isAffordable: true,
          isWithinRemainingBudget: true,
          purchaseAvailability: { status: 'available' as const },
          recommendation: { tier: 'neutral' as const, reasons: [], specificity: 'exact' as const },
          disabledReasons: [],
        },
      },
      row,
    } satisfies QuickNpcWeaponRequirementOption

    const projection = projectWeaponRequirementPreview(entry)

    expect(projection.description).toBeTruthy()
    expect(projection.description).not.toContain('[object Object]')
  })
})
