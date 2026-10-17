import { describe, expect, it } from 'vitest'

import { EQUIPMENT_EFFECT_TARGET_ENTRIES, MAGIC_PROPERTY_CATEGORY_ENTRIES } from '@rpg/contracts'

import {
  equipmentAdjustmentsSectionDescription,
  equipmentInstanceEditorBackTargetLabel,
  equipmentInstanceEditorModeTitle,
  formatMagicalPropertiesRemovalWarning,
  magicPropertyCategoryLabel,
} from './equipment-instance-editor-form-labels'
import type { EquipmentEditorState } from './equipment-editor-types'

function editorState(mode: EquipmentEditorState['mode']): EquipmentEditorState {
  return {
    mode,
    session: {
      sourceEntryId: 'e1',
      scope: 'one',
      draft: { equipmentId: 'dagger' },
      openedSnapshot: { equipmentId: 'dagger' },
    },
  }
}

describe('equipmentInstanceEditorFormLabels', () => {
  it('derives mode titles and matching back targets for adjustment flows', () => {
    const choose = editorState({ kind: 'effectChoose', draft: { bonus: 1 }, returnTo: 'main' })
    expect(equipmentInstanceEditorModeTitle(choose)).toBe('Add adjustment')
    expect(equipmentInstanceEditorBackTargetLabel(choose)).toBe('Add adjustment')
  })

  it('formats magical property removal warning with done label', () => {
    expect(formatMagicalPropertiesRemovalWarning(1)).toBe(
      '1 magic property will be removed when you click Done.',
    )
    expect(formatMagicalPropertiesRemovalWarning(2)).toBe(
      '2 magic properties will be removed when you click Done.',
    )
  })

  it('builds adjustments section copy from effect target vocabulary', () => {
    expect(equipmentAdjustmentsSectionDescription()).toContain(
      EQUIPMENT_EFFECT_TARGET_ENTRIES.attack_roll.label,
    )
    expect(equipmentAdjustmentsSectionDescription()).toContain(
      EQUIPMENT_EFFECT_TARGET_ENTRIES.armor_class.label,
    )
  })

  it('uses magic property category vocabulary labels', () => {
    expect(magicPropertyCategoryLabel('enhancement')).toBe(
      MAGIC_PROPERTY_CATEGORY_ENTRIES.enhancement.label,
    )
  })
})
