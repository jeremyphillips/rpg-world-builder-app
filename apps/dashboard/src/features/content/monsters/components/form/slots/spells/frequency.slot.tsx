import { useArrayFieldContext } from '@rpg/ui/form'

import { MonsterSpellFrequencyField } from '../../monster-spell-frequency-field'

export function MonsterSpellFrequencySlot() {
  const array = useArrayFieldContext()
  if (!array?.fullArrayName) return null
  const actionPath = array.fullArrayName.replace(/\.spells$/, '')
  return (
    <MonsterSpellFrequencyField
      spellLimitName={`${array.fullArrayName}.${array.rowIndex}.limitedUse`}
      actionLimitName={`${actionPath}.limitedUse`}
    />
  )
}
