import { resolveDamageDefenseOptionState, type CreatureDamageDefenseList } from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import type { MonsterFormValues } from './monster-form-values'

export function damageDefenseComboboxOptions(
  activeList: CreatureDamageDefenseList,
  defenses: MonsterFormValues['defenses'],
  damageTypeOptions: readonly FieldOption[],
): FieldOption[] {
  return damageTypeOptions.map((option) => {
    const state = resolveDamageDefenseOptionState(option.value, activeList, defenses)
    return {
      ...option,
      disabled: Boolean(option.disabled) || state.disabled,
      ...(state.disabledReason ? { disabledReason: state.disabledReason } : {}),
    }
  })
}
