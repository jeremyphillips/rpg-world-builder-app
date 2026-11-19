import { describe, expect, it } from 'vitest'

import { creatureFormsDraftSchema, creatureFormsSchema } from './forms'

describe('creature form movement overrides', () => {
  it('accepts draft movement rows with explicit zero and empty speeds', () => {
    expect(
      creatureFormsDraftSchema.parse({
        profileFormId: 'p',
        trueForm: { kind: 'profile' },
        definedForms: [
          {
            id: 'bat',
            name: 'Bat',
            overrides: { movement: { speeds: { walk: 0, fly: 30 } } },
          },
        ],
      }).definedForms[0]?.overrides?.movement?.speeds,
    ).toEqual({ walk: 0, fly: 30 })

    expect(
      creatureFormsDraftSchema.parse({
        profileFormId: 'p',
        trueForm: { kind: 'profile' },
        definedForms: [{ id: 'mist', name: 'Mist', overrides: { movement: { speeds: {} } } }],
      }).definedForms[0]?.overrides?.movement?.speeds,
    ).toEqual({})
  })

  it('rejects hover without fly speed at publish', () => {
    const parsed = creatureFormsSchema.safeParse({
      profileFormId: 'p',
      trueForm: { kind: 'profile' },
      definedForms: [
        {
          id: 'mist',
          name: 'Mist',
          overrides: { movement: { speeds: { walk: 5 }, hover: true } },
        },
      ],
    })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error.issues).toContainEqual(
        expect.objectContaining({ message: 'Hover requires a fly speed.' }),
      )
    }
  })
})
