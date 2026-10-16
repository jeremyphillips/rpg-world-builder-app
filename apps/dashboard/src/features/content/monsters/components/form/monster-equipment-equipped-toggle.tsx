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
        {/*
         * TooltipTrigger must not merge onto Checkbox — both use `data-state`
         * (open/closed vs checked/unchecked), which breaks circle checked styling.
         */}
        <TooltipTrigger interactive asChild>
          <span className="inline-flex shrink-0 self-center">
            <Checkbox
              appearance="circle"
              checked={checked}
              disabled={disabled}
              aria-label={formatMonsterEquipmentEquippedAriaLabel(displayName)}
              onCheckedChange={(next) => onCheckedChange(next === true)}
            />
          </span>
        </TooltipTrigger>
        <TooltipContent arrow side="top">
          {tooltipLabel}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
