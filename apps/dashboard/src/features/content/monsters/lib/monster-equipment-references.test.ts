import { describe, expect, it } from 'vitest'

import { findActionsReferencingEntry } from './monster-equipment-references'
import type { MonsterFormValues } from './monster-form-values'

function formWithEquipment(equipment: MonsterFormValues['equipment']): MonsterFormValues {
  return {
    equipment,
    actions: [{ id: 'strike', kind: 'weapon', equipmentEntryId: 'stack' }],
    bonusActions: [],
    reactions: [],
  } as unknown as MonsterFormValues
}

describe('monster equipment action references', () => {
  it('finds weapon actions referencing an entry id', () => {
    const refs = findActionsReferencingEntry(formWithEquipment([]), 'stack')
    expect(refs).toEqual([{ section: 'actions', id: 'strike', name: undefined }])
  })
})
