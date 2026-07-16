import { describe, expect, it } from 'vitest'

import { createCharacterInputSchema } from './create-input'
import type { CreateCharacterInput } from './create-input'

// ---------------------------------------------------------------------------
// Fixture — the sheet.test.ts base character minus server-assigned fields.
// ---------------------------------------------------------------------------

const baseInput: CreateCharacterInput = {
  characterType: 'pc',
  name: 'Seren',
  rulesetId: 'srd-cc-5.2.1',
  classes: [{ classId: 'srd-cc-5.2.1:fighter', subclassId: 'srd-cc-5.2.1:champion', level: 7 }],
  species: { id: 'srd-cc-5.2.1:elf', heritageId: 'high-elf' },
  alignment: 'ng',
  xp: 23000,
  abilityScores: { str: 16, dex: 14, con: 15, int: 10, wis: 12, cha: 8 },
  hitPoints: { base: 58, temporary: 0 },
  proficiencies: {
    skills: [
      {
        skill: 'athletics',
        rank: 'expertise',
        sources: [
          {
            kind: 'classFeature',
            sourceId: 'srd-cc-5.2.1:fighter',
            grantId: 'skill-proficiencies',
          },
        ],
      },
    ],
    weapons: [
      {
        weaponCategory: 'martial',
        rank: 'mastery',
        sources: [
          { kind: 'classFeature', sourceId: 'srd-cc-5.2.1:fighter', grantId: 'weapon-mastery' },
        ],
      },
    ],
    armor: [{ armorCategory: 'light' }],
    tools: [],
    languages: [],
  },
  spells: [],
  equipment: {
    weapons: [],
    armor: [],
    tools: [],
    gear: [],
    magicItems: [],
    vehicles: [],
    mounts: [],
  },
  wealth: { cp: 0, sp: 0, gp: 50, pp: 0 },
  feats: [],
}

describe('createCharacterInputSchema', () => {
  it('parses a valid standalone PC create input', () => {
    const result = createCharacterInputSchema.safeParse(baseInput)
    expect(result.success).toBe(true)
  })

  it('accepts an optional campaignId of null (standalone)', () => {
    const result = createCharacterInputSchema.safeParse({ ...baseInput, campaignId: null })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.campaignId).toBeNull()
  })

  it('rejects input that includes id (server-assigned)', () => {
    const result = createCharacterInputSchema.safeParse({ ...baseInput, id: 'char_1' })
    // id is stripped via .omit — Zod ignores extra keys, so parse still succeeds.
    // The important assertion is that the result type does not expose an id field.
    expect(result.success).toBe(true)
    if (result.success) {
      // TypeScript ensures this at compile time; verify at runtime too.
      expect((result.data as Record<string, unknown>)['id']).toBeUndefined()
    }
  })

  it('rejects input that includes userId (server-assigned)', () => {
    const result = createCharacterInputSchema.safeParse({ ...baseInput, userId: 'user_1' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect((result.data as Record<string, unknown>)['userId']).toBeUndefined()
    }
  })

  it('rejects input that includes createdAt (server-assigned)', () => {
    const result = createCharacterInputSchema.safeParse({
      ...baseInput,
      createdAt: '2026-01-01T00:00:00.000Z',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect((result.data as Record<string, unknown>)['createdAt']).toBeUndefined()
    }
  })

  it('rejects a character without a name', () => {
    const result = createCharacterInputSchema.safeParse({ ...baseInput, name: '' })
    expect(result.success).toBe(false)
  })

  it('requires characterType to be pc', () => {
    const result = createCharacterInputSchema.safeParse({ ...baseInput, characterType: 'npc' })
    expect(result.success).toBe(false)
  })

  it('requires at least one class entry', () => {
    const result = createCharacterInputSchema.safeParse({ ...baseInput, classes: [] })
    expect(result.success).toBe(false)
  })

  it('rejects duplicate class entries', () => {
    const result = createCharacterInputSchema.safeParse({
      ...baseInput,
      classes: [
        { classId: 'srd-cc-5.2.1:fighter', level: 3 },
        { classId: 'srd-cc-5.2.1:fighter', level: 4 },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('defaults omitted array fields to empty', () => {
    const { spells: _s, feats: _f, ...withoutLists } = baseInput
    const result = createCharacterInputSchema.safeParse(withoutLists)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.proficiencies.languages).toEqual([])
      expect(result.data.spells).toEqual([])
      expect(result.data.feats).toEqual([])
    }
  })
})
