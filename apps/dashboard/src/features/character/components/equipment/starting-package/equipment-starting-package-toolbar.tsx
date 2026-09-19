import { Button } from '@rpg/ui'

import {
  EQUIPMENT_PACKAGE_CHANGE_OPTION_LABEL,
  EQUIPMENT_PACKAGE_CUSTOMIZE_LABEL,
} from '../../../lib/equipment/equipment-step.lib'
import {
  equipmentInventoryColumnToolbarClasses,
  equipmentInventoryColumnToolbarSeparatorClasses,
} from '../inventory/equipment-inventory.variants'

export type EquipmentStartingPackageToolbarProps = {
  customizeDisabled: boolean
  conversionEditorOpen?: boolean
  customizeControlsId?: string
  onCustomize?: () => void
  onChangeEquipmentOption?: () => void
}

export function EquipmentStartingPackageToolbar({
  customizeDisabled,
  conversionEditorOpen = false,
  customizeControlsId,
  onCustomize,
  onChangeEquipmentOption,
}: EquipmentStartingPackageToolbarProps) {
  return (
    <div className={equipmentInventoryColumnToolbarClasses}>
      <Button
        type="button"
        variant="text"
        size="sm"
        disabled={customizeDisabled}
        aria-expanded={conversionEditorOpen}
        aria-controls={customizeControlsId}
        onClick={onCustomize}
      >
        {EQUIPMENT_PACKAGE_CUSTOMIZE_LABEL}
      </Button>
      <span aria-hidden className={equipmentInventoryColumnToolbarSeparatorClasses}>
        ·
      </span>
      <Button type="button" variant="text" size="sm" onClick={onChangeEquipmentOption}>
        {EQUIPMENT_PACKAGE_CHANGE_OPTION_LABEL}
      </Button>
    </div>
  )
}
