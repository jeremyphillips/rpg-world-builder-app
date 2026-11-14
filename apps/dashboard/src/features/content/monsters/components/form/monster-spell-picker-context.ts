import { createContext, useContext } from 'react'

export const MONSTER_SPELL_PICKER_INTERCEPT = 'monster-spell-picker'

export type MonsterSpellPickerContextValue = {
  openChange: (index: number) => void
}

export const MonsterSpellPickerContext = createContext<MonsterSpellPickerContextValue | null>(null)

export function useMonsterSpellPicker(): MonsterSpellPickerContextValue | null {
  return useContext(MonsterSpellPickerContext)
}
