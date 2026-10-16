import { Checkbox, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@rpg/ui'

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
  const tooltipLabel = checked
    ? MONSTER_EQUIP_TOGGLE_UNEQUIP_LABEL
    : MONSTER_EQUIP_TOGGLE_EQUIP_LABEL

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger interactive asChild>
          <Checkbox
            appearance="circle"
            checked={checked}
            disabled={disabled}
            aria-label={formatMonsterEquipmentEquippedAriaLabel(displayName)}
            onCheckedChange={(next) => onCheckedChange(next === true)}
          />
        </TooltipTrigger>
        <TooltipContent arrow side="top">
          {tooltipLabel}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
