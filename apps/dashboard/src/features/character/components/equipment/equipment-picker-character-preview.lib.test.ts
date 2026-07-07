import { DEFAULT_ARMOR_CLASS_BASE } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import {
  EQUIPMENT_PICKER_PREVIEW_AC_IF_EQUIPPED_LABEL,
  EQUIPMENT_PICKER_PREVIEW_ATTACK_LABEL,
  EQUIPMENT_PICKER_PREVIEW_DAMAGE_LABEL,
  EQUIPMENT_PICKER_PREVIEW_REMAINING_AFTER_PURCHASE_LABEL,
  formatEquipmentPickerItemDetails,
  resolveEquipmentPickerCharacterPreviewLines,
} from './equipment-picker-character-preview.lib'
import {
  equipmentPickerBudgetFixture,
  equipmentPickerChainMailFixture,
  equipmentPickerLongswordFixture,
} from './equipment-picker-drawer.fixtures'

const previewContext = {
  level: 1,
  armorClassBase: DEFAULT_ARMOR_CLASS_BASE,
  abilityScores: { str: 16, dex: 14 },
  equippedArmor: [],
  budget: equipmentPickerBudgetFixture,
}

describe('resolveEquipmentPickerCharacterPreviewLines', () => {
  it('includes weapon attack and damage previews when ability scores are set', () => {
    const lines = resolveEquipmentPickerCharacterPreviewLines(
      equipmentPickerLongswordFixture,
      previewContext,
      { isProficient: true },
    )

    expect(lines).toContain(`${EQUIPMENT_PICKER_PREVIEW_ATTACK_LABEL}: +5`)
    expect(lines).toContain(`${EQUIPMENT_PICKER_PREVIEW_DAMAGE_LABEL}: 1d8 +3`)
    expect(lines).toContain(
      `${EQUIPMENT_PICKER_PREVIEW_REMAINING_AFTER_PURCHASE_LABEL}: 2 PP, 5 GP`,
    )
  })

  it('includes armor AC-if-equipped previews for heavy armor without DEX', () => {
    const lines = resolveEquipmentPickerCharacterPreviewLines(
      equipmentPickerChainMailFixture,
      previewContext,
      { isProficient: false },
    )

    expect(lines).toContain(`${EQUIPMENT_PICKER_PREVIEW_AC_IF_EQUIPPED_LABEL}: 16`)
  })

  it('omits weapon previews when ability scores are incomplete', () => {
    const lines = resolveEquipmentPickerCharacterPreviewLines(
      equipmentPickerLongswordFixture,
      { ...previewContext, abilityScores: {} },
      { isProficient: true },
    )

    expect(lines.some((line) => line.startsWith(EQUIPMENT_PICKER_PREVIEW_ATTACK_LABEL))).toBe(false)
  })
})

describe('formatEquipmentPickerItemDetails', () => {
  it('leaves catalog-only details when previews are disabled', () => {
    expect(
      formatEquipmentPickerItemDetails(equipmentPickerLongswordFixture, {
        showCharacterPreview: false,
        characterPreviewContext: previewContext,
      }),
    ).not.toContain(EQUIPMENT_PICKER_PREVIEW_ATTACK_LABEL)
  })

  it('appends preview lines when enabled', () => {
    const details = formatEquipmentPickerItemDetails(
      equipmentPickerLongswordFixture,
      {
        showCharacterPreview: true,
        characterPreviewContext: previewContext,
        isProficient: true,
      },
      'Catalog details',
    )

    expect(details).toContain('Catalog details')
    expect(details).toContain(`${EQUIPMENT_PICKER_PREVIEW_ATTACK_LABEL}: +5`)
  })
})
