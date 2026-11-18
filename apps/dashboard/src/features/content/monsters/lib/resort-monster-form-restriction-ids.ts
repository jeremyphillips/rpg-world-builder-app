import {
  MONSTER_ACTION_SECTIONS,
  monsterActionSectionRows,
  readMonsterRowFormRestrictionIds,
  sortMonsterFormRestrictionIds,
  type CreatureFormsDraft,
} from '@rpg/contracts'
import type { UseFormReturn } from 'react-hook-form'

import type { MonsterFormValues } from './monster-form-values'

type RestrictedRow = Record<string, unknown>

function resortRestrictedRow(row: RestrictedRow, forms: CreatureFormsDraft): RestrictedRow {
  const ids = readMonsterRowFormRestrictionIds(row)
  if (!ids || ids.length < 2) return row
  const sorted = sortMonsterFormRestrictionIds(ids, forms)
  if (sorted.length === ids.length && sorted.every((id, index) => id === ids[index])) return row
  return { ...row, onlyInFormIds: sorted }
}

function sameRowList(left: readonly RestrictedRow[], right: readonly RestrictedRow[]): boolean {
  return left.length === right.length && left.every((row, index) => row === right[index])
}

/** Re-sorts every stored `onlyInFormIds` list to match `forms` defined-form order. */
export function resortMonsterFormRestrictionIds(
  form: UseFormReturn<MonsterFormValues>,
  forms: CreatureFormsDraft,
): void {
  const values = form.getValues()
  const write = { shouldDirty: true, shouldValidate: false } as const

  if (values.traits) {
    const traits = values.traits.map((row) => resortRestrictedRow(row as RestrictedRow, forms))
    if (!sameRowList(values.traits as RestrictedRow[], traits)) {
      form.setValue('traits', traits as MonsterFormValues['traits'], write)
    }
  }

  for (const section of MONSTER_ACTION_SECTIONS) {
    const current = [...monsterActionSectionRows(values, section)] as RestrictedRow[]
    if (current.length === 0) continue
    const next = current.map((row) => resortRestrictedRow(row, forms))
    if (sameRowList(current, next)) continue
    if (section === 'legendaryActions') {
      form.setValue(
        'legendaryActions',
        {
          ...(values.legendaryActions ?? {}),
          actions: next,
        } as MonsterFormValues['legendaryActions'],
        write,
      )
    } else {
      form.setValue(section, next as never, write)
    }
  }
}
