import { describe, expect, it } from 'vitest'

import { createCharacterInputSchema } from '@rpg/contracts'

import { normalizeStoredCharacterRecordForRead } from './normalize-stored-character-for-read.lib'
import { toNpcCharacter } from '../to-npc-character'
import { minimalStandalonePcInput } from '../../../test/fixtures/characters'

describe('normalizeStoredCharacterRecordForRead', () => {
  it('fills missing spell access and media roles on stored documents', () => {
    const normalized = normalizeStoredCharacterRecordForRead({
      spells: [
        {
          spellId: 'srd-cc-5.2.1:fire-bolt',
          sources: [{ kind: 'manual' }],
        },
      ],
      media: {
        revision: 0,
        images: [],
      },
    })

    expect(normalized.spells[0]).toMatchObject({ access: {} })
    expect(normalized.media).toMatchObject({ roles: {} })
  })

  it('maps minimized legacy rows through toNpcCharacter', () => {
    const npc = toNpcCharacter({
      ...minimalStandalonePcInput,
      characterType: 'npc',
      _id: '507f1f77bcf86cd799439011',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      spells: [
        {
          spellId: 'srd-cc-5.2.1:fire-bolt',
          sources: [{ kind: 'manual' }],
        },
      ],
      media: {
        revision: 0,
        images: [],
      },
    } as Parameters<typeof toNpcCharacter>[0])

    expect(npc.spells[0]?.access).toEqual({})
    expect(npc.media?.roles).toEqual({})
  })

  it('does not loosen create input validation for omitted access or roles', () => {
    const withoutAccess = createCharacterInputSchema.safeParse({
      ...minimalStandalonePcInput,
      spells: [
        {
          spellId: 'srd-cc-5.2.1:fire-bolt',
          sources: [{ kind: 'manual' }],
        },
      ],
    })
    expect(withoutAccess.success).toBe(false)

    const withoutRoles = createCharacterInputSchema.safeParse({
      ...minimalStandalonePcInput,
      media: {
        revision: 0,
        images: [],
      },
    })
    expect(withoutRoles.success).toBe(false)
  })
})
