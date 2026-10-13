import { describe, expect, it } from 'vitest'

import { commitEquipmentEditorSession } from '@/features/content/equipment/lib/instance-editor/commit-equipment-editor-session'
import { createEquipmentEditorState } from '@/features/content/equipment/lib/instance-editor/equipment-editor-reducer'

import { findActionsReferencingEntry } from './monster-equipment-references'
import type { MonsterFormValues } from './monster-form-values'

describe('equipment split and action references', () => {
  it('keeps action equipmentEntryId on the source stack after a one-scope split', () => {
    const source = {
      entryId: 'stack',
      equipmentId: 'srd-cc-5.2.1:dagger',
      quantity: 2,
      equipped: true,
    }
    const session = createEquipmentEditorState({ sourceEntry: source }).session
    const committed = commitEquipmentEditorSession([source], {
      ...session,
      scope: 'one',
      draft: {
        ...session.draft,
        quantity: 1,
        magical: true,
      },
    })

    const values = {
      equipment: committed,
      actions: [{ id: 'strike', kind: 'weapon', equipmentEntryId: 'stack' }],
      bonusActions: [],
      reactions: [],
    } as MonsterFormValues

    expect(committed).toHaveLength(2)
    expect(findActionsReferencingEntry(values, 'stack')).toHaveLength(1)
    expect(
      committed.some((row) => row.entryId !== 'stack' && row.magical && row.quantity === 1),
    ).toBe(true)
  })
})
