import { describe, expect, it } from 'vitest'

import {
  PRIMARY_SPELLCASTING_DUPLICATE_MESSAGE,
  PRIMARY_SPELLCASTING_SECTION_MESSAGE,
} from './spell-casting-source'
import { createMonsterDraftInputSchema, createMonsterInputSchema } from '../monster'
import { MONSTER_TEST_BODY } from './test-fixtures'

describe('monster spell entries', () => {
  const spellcasting = {
    id: 'spellcasting',
    kind: 'spell' as const,
    profile: 'primary' as const,
    name: 'Spellcasting',
    castingAbility: { kind: 'ability' as const, ability: 'int' as const },
    spells: [{ spellId: 'srd-cc-5.2.1:mage-hand' }],
  }

  it('accepts every kind in every section and an optional reaction trigger', () => {
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'kinds',
        ...MONSTER_TEST_BODY,
        actions: [spellcasting],
        bonusActions: [{ id: 'note', kind: 'special', name: 'Note', description: '<p>n</p>' }],
        reactions: [
          { ...spellcasting, id: 'react-spell', name: 'Protective Magic', profile: undefined },
        ],
      }).success,
    ).toBe(true)
  })

  it('rejects an entry limit combined with a group limit and duplicate spell ids', () => {
    const limited = {
      kind: 'uses' as const,
      count: { kind: 'fixed' as const, value: 1 },
      recovery: { minimumRest: 'long' as const },
    }
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'both-limits',
        ...MONSTER_TEST_BODY,
        actions: [
          {
            ...spellcasting,
            limitedUse: limited,
            spells: [{ spellId: 'srd-cc-5.2.1:mage-hand', limitedUse: limited }],
          },
        ],
      }).success,
    ).toBe(false)
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'dup-spells',
        ...MONSTER_TEST_BODY,
        actions: [
          {
            ...spellcasting,
            spells: [{ spellId: 'srd-cc-5.2.1:mage-hand' }, { spellId: 'srd-cc-5.2.1:mage-hand' }],
          },
        ],
      }).success,
    ).toBe(false)
  })

  it('rejects duplicate direct casting names when published and allows them on drafts', () => {
    const second = { ...spellcasting, id: 'other-spellcasting', profile: undefined, name: 'Innate' }
    const namedAgain = { ...second, id: 'innate-again' }
    expect(
      createMonsterDraftInputSchema.safeParse({
        slug: 'draft-dup-name',
        ...MONSTER_TEST_BODY,
        actions: [spellcasting, second, namedAgain],
      }).success,
    ).toBe(true)
    const published = createMonsterInputSchema.safeParse({
      slug: 'dup-name',
      ...MONSTER_TEST_BODY,
      actions: [spellcasting, second, namedAgain],
    })
    expect(published.success).toBe(false)
    if (!published.success) {
      expect(published.error.issues.some((issue) => issue.message.includes('unique names'))).toBe(
        true,
      )
    }
  })

  it('rejects a published attack share with a missing spell source', () => {
    const attack = {
      id: 'burst',
      kind: 'attack' as const,
      name: 'Arcane Burst',
      bonusSource: {
        kind: 'spellcasting' as const,
        castingAbility: { kind: 'shared' as const, entryId: 'missing' },
      },
      modes: ['ranged' as const],
      range: { normal: 120 },
      damage: { dice: { count: 1, faces: 8 } },
      damageType: 'force',
    }
    expect(
      createMonsterDraftInputSchema.safeParse({
        slug: 'draft-burst',
        ...MONSTER_TEST_BODY,
        actions: [attack],
      }).success,
    ).toBe(true)
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'burst',
        ...MONSTER_TEST_BODY,
        actions: [attack],
      }).success,
    ).toBe(false)
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'burst-linked',
        ...MONSTER_TEST_BODY,
        actions: [
          spellcasting,
          {
            ...attack,
            bonusSource: {
              kind: 'spellcasting' as const,
              castingAbility: { kind: 'shared' as const, entryId: 'spellcasting' },
            },
          },
        ],
      }).success,
    ).toBe(true)
  })

  it('requires a shared ability target to be another spell entry with its own ability', () => {
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'shared',
        ...MONSTER_TEST_BODY,
        actions: [
          spellcasting,
          {
            id: 'misty-step',
            kind: 'spell',
            name: 'Misty Step',
            castingAbility: { kind: 'shared', entryId: 'spellcasting' },
            spells: [{ spellId: 'srd-cc-5.2.1:misty-step' }],
          },
        ],
      }).success,
    ).toBe(true)
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'shared-self',
        ...MONSTER_TEST_BODY,
        actions: [
          {
            ...spellcasting,
            castingAbility: { kind: 'shared', entryId: 'spellcasting' },
          },
        ],
      }).success,
    ).toBe(false)
  })

  it('allows one primary Spellcasting profile and only in Actions', () => {
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'primary',
        ...MONSTER_TEST_BODY,
        actions: [spellcasting],
        bonusActions: [
          {
            id: 'shield',
            kind: 'spell',
            name: 'Shield',
            castingAbility: { kind: 'shared', entryId: 'spellcasting' },
            spells: [{ spellId: 'srd-cc-5.2.1:shield' }],
          },
        ],
      }).success,
    ).toBe(true)
    const duplicate = createMonsterInputSchema.safeParse({
      slug: 'two',
      ...MONSTER_TEST_BODY,
      actions: [spellcasting, { ...spellcasting, id: 'again' }],
    })
    expect(duplicate.success).toBe(false)
    if (!duplicate.success) {
      expect(
        duplicate.error.issues.some(
          (issue) => issue.message === PRIMARY_SPELLCASTING_DUPLICATE_MESSAGE,
        ),
      ).toBe(true)
    }
    const moved = createMonsterInputSchema.safeParse({
      slug: 'bonus',
      ...MONSTER_TEST_BODY,
      bonusActions: [spellcasting],
    })
    expect(moved.success).toBe(false)
    if (!moved.success) {
      expect(
        moved.error.issues.some((issue) => issue.message === PRIMARY_SPELLCASTING_SECTION_MESSAGE),
      ).toBe(true)
    }
  })
})
