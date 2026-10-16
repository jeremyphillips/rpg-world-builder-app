import { Checkbox } from '@rpg/ui'

import {
  MONSTER_EQUIP_TOGGLE_EQUIP_LABEL,
  MONSTER_EQUIP_TOGGLE_UNEQUIP_LABEL,
  formatMonsterEquipmentEquippedAriaLabel,
} from '../../lib/monster-form-labels'

export type MonsterEquipmentEquippedToggleProps = {
  displayName: string
  checked: boolean
  disabled?: boolean
  onCheckedChange: (checked: boolean) => void
}

export function MonsterEquipmentEquippedToggle({
  displayName,
  checked,
  disabled,
  onCheckedChange,
}: MonsterEquipmentEquippedToggleProps) {
  const expandLabel = checked
    ? MONSTER_EQUIP_TOGGLE_UNEQUIP_LABEL
    : MONSTER_EQUIP_TOGGLE_EQUIP_LABEL
  const expandLabelReserve = checked
    ? MONSTER_EQUIP_TOGGLE_EQUIP_LABEL
    : MONSTER_EQUIP_TOGGLE_UNEQUIP_LABEL

  return (
    <Checkbox
      appearance="circle"
      focusContext="embedded"
      expandLabel={expandLabel}
      expandLabelReserve={expandLabelReserve}
      checked={checked}
      disabled={disabled}
      aria-label={formatMonsterEquipmentEquippedAriaLabel(displayName)}
      onCheckedChange={(next) => onCheckedChange(next === true)}
    />
  )
}
