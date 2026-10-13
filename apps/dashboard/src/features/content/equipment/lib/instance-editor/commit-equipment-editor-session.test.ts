import { describe, expect, it } from 'vitest'

import { commitEquipmentEditorSession } from './commit-equipment-editor-session'
import { createEquipmentEditorState } from './equipment-editor-reducer'

const source = {
  entryId: 'source',
  equipmentId: 'srd-cc-5.2.1:dagger',
  quantity: 2,
  equipped: true,
}

describe('commitEquipmentEditorSession', () => {
  it('leaves entries unchanged when the source stack was removed while the editor was open', () => {
    const session = createEquipmentEditorState({ sourceEntry: source }).session
    const other = {
      entryId: 'other',
      equipmentId: 'srd-cc-5.2.1:longsword',
      quantity: 1,
      equipped: true,
    }
    const committed = commitEquipmentEditorSession([other], {
      ...session,
      scope: 'all',
      draft: { ...session.draft, equipped: false },
    })
    expect(committed).toEqual([other])
  })

  it('commits by entryId when the equipment list order changes', () => {
    const session = createEquipmentEditorState({ sourceEntry: source }).session
    const other = {
      entryId: 'other',
      equipmentId: 'srd-cc-5.2.1:longsword',
      quantity: 1,
      equipped: true,
    }
    const committed = commitEquipmentEditorSession([other, source], {
      ...session,
      scope: 'all',
      draft: { ...session.draft, customName: 'Renamed stack' },
    })
    expect(committed[1]).toMatchObject({
      entryId: 'source',
      customName: 'Renamed stack',
      quantity: 2,
    })
    expect(committed[0]).toEqual(other)
  })

  it('preserves entryId on the source stack and assigns a new id to the split copy', () => {
    const session = createEquipmentEditorState({ sourceEntry: source }).session
    const committed = commitEquipmentEditorSession(
      [source],
      {
        ...session,
        scope: 'one',
        draft: {
          ...session.draft,
          quantity: 1,
          customName: 'Custom dagger',
        },
      },
      () => 'split-copy',
    )
    expect(committed[0]?.entryId).toBe('source')
    expect(committed[1]?.entryId).toBe('split-copy')
    expect(committed[0]?.quantity).toBe(1)
    expect(committed[1]).toMatchObject({ customName: 'Custom dagger' })
  })
})
