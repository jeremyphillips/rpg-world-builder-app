import { CheckboxOption } from '@rpg/ui'

export const OUTSIDE_WATER_BREATH_TOGGLE_LABEL = 'Hold breath outside water'

export type OutsideWaterBreathToggleProps = {
  enabled: boolean
  onEnable: () => void
  onDisable: () => void
  label?: string
}

export function OutsideWaterBreathToggle({
  enabled,
  onEnable,
  onDisable,
  label = OUTSIDE_WATER_BREATH_TOGGLE_LABEL,
}: OutsideWaterBreathToggleProps) {
  return (
    <CheckboxOption
      shell="outlined"
      label={label}
      checked={enabled}
      onCheckedChange={(checked) => {
        if (checked) {
          onEnable()
          return
        }
        onDisable()
      }}
    />
  )
}
