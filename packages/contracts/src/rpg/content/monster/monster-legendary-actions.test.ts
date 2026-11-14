import { describe, expect, it } from 'vitest'

import {
  createMonsterInputSchema,
  monsterActionSchema,
  monsterLegendaryActionDraftSchema,
  monsterLegendaryActionSchema,
  monsterReactionSchema,
} from '../monster'
import { BITE_ACTION, MONSTER_TEST_INPUT, issueMessages } from './test-fixtures'

const spellcastingAction = {
  id: 'spellcasting',
  kind: 'spell' as const,
  profile: 'primary' as const,
  name: 'Spellcasting',
  castingAbility: { kind: 'ability' as const, ability: 'cha' as const },
  spells: [{ spellId: 'srd-cc-5.2.1:scorching-ray', castAtLevel: 3 }],
}

function legendarySpell(spellId: string, castAtLevel?: number, invocation?: 'use-entry') {
  return {
    id: 'legendary-spell',
    kind: 'spell' as const,
    name: 'Fiery Rays',
    ...(invocation ? { spellInvocation: invocation } : {}),
    castingAbility: { kind: 'shared' as const, entryId: 'spellcasting' },
    spells: [{ spellId, ...(castAtLevel !== undefined ? { castAtLevel } : {}) }],
  }
}

const reference = {
  id: 'pounce',
  kind: 'action-reference' as const,
  name: 'Pounce',
  actionIds: ['bite'],
}

describe('legendary actions', () => {
  it('accepts only a reference, a spell, or a custom ability', () => {
    expect(monsterLegendaryActionSchema.safeParse(reference).success).toBe(true)
    expect(
      monsterLegendaryActionSchema.safeParse({
        id: 'note',
        kind: 'special',
        name: 'Deathly Teleport',
        description: '<p>The lich teleports.</p>',
      }).success,
    ).toBe(true)
    expect(
      monsterLegendaryActionSchema.safeParse(legendarySpell('srd-cc-5.2.1:fear')).success,
    ).toBe(true)
    for (const kind of ['weapon', 'save', 'multiattack'] as const) {
      expect(monsterLegendaryActionSchema.safeParse({ id: 'row', kind, name: 'Row' }).success).toBe(
        false,
      )
    }
    expect(monsterActionSchema.safeParse(reference).success).toBe(false)
    expect(monsterReactionSchema.safeParse(reference).success).toBe(false)
    expect(
      monsterLegendaryActionDraftSchema.safeParse({ ...reference, actionIds: [] }).success,
    ).toBe(true)
  })

  it('requires a uses pool only when legendary rows exist', () => {
    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...MONSTER_TEST_INPUT,
          actions: [BITE_ACTION],
          legendaryActions: [reference],
        }),
      ),
    ).toContain('Enter legendary action uses.')

    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...MONSTER_TEST_INPUT,
          legendaryActionUses: 3,
        }),
      ),
    ).toContain('Legendary action uses require a legendary action.')

    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...MONSTER_TEST_INPUT,
          legendaryActionUses: 3,
          legendaryActionUsesInLair: 3,
          legendaryActions: [
            {
              id: 'note',
              kind: 'special',
              name: 'Deathly Teleport',
              description: '<p>The lich teleports.</p>',
            },
          ],
        }),
      ),
    ).toContain('In-lair uses must be greater than legendary action uses.')

    expect(
      createMonsterInputSchema.safeParse({
        ...MONSTER_TEST_INPUT,
        legendaryActionUses: 3,
        legendaryActionUsesInLair: 4,
        actions: [BITE_ACTION],
        legendaryActions: [
          {
            ...reference,
            movement: { allowance: 'half-speed' },
          },
        ],
      }).success,
    ).toBe(true)
  })

  it('requires exactly one spell and keeps use-entry inside Legendary Actions', () => {
    expect(
      createMonsterInputSchema.safeParse({
        ...MONSTER_TEST_INPUT,
        legendaryActionUses: 3,
        actions: [spellcastingAction],
        legendaryActions: [legendarySpell('srd-cc-5.2.1:fear')],
      }).success,
    ).toBe(true)

    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...MONSTER_TEST_INPUT,
          legendaryActionUses: 3,
          actions: [spellcastingAction],
          legendaryActions: [
            {
              ...legendarySpell('srd-cc-5.2.1:fear'),
              spells: [{ spellId: 'srd-cc-5.2.1:fear' }, { spellId: 'srd-cc-5.2.1:scorching-ray' }],
            },
          ],
        }),
      ),
    ).toContain('Choose one spell.')

    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...MONSTER_TEST_INPUT,
          actions: [
            {
              ...spellcastingAction,
              spellInvocation: 'use-entry',
              castingAbility: { kind: 'shared', entryId: 'other' },
            },
          ],
        }),
      ),
    ).toContain('Spellcasting references are only valid in Legendary Actions.')

    expect(
      createMonsterInputSchema.safeParse({
        ...MONSTER_TEST_INPUT,
        legendaryActionUses: 3,
        actions: [spellcastingAction],
        legendaryActions: [legendarySpell('srd-cc-5.2.1:scorching-ray', 3, 'use-entry')],
      }).success,
    ).toBe(true)

    expect(
      createMonsterInputSchema.safeParse({
        ...MONSTER_TEST_INPUT,
        legendaryActionUses: 3,
        actions: [spellcastingAction],
        legendaryActions: [legendarySpell('srd-cc-5.2.1:scorching-ray', undefined, 'use-entry')],
      }).success,
    ).toBe(true)

    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...MONSTER_TEST_INPUT,
          legendaryActionUses: 3,
          actions: [spellcastingAction],
          legendaryActions: [legendarySpell('srd-cc-5.2.1:fear', undefined, 'use-entry')],
        }),
      ),
    ).toContain("This spell isn't on the selected Spellcasting action.")

    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...MONSTER_TEST_INPUT,
          legendaryActionUses: 3,
          actions: [spellcastingAction],
          legendaryActions: [legendarySpell('srd-cc-5.2.1:scorching-ray', 2, 'use-entry')],
        }),
      ),
    ).toContain('Cast level must match the Spellcasting action.')

    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...MONSTER_TEST_INPUT,
          legendaryActionUses: 3,
          legendaryActions: [legendarySpell('srd-cc-5.2.1:scorching-ray', 3, 'use-entry')],
        }),
      ),
    ).toContain('Shared spellcasting must use another spell entry that has its own ability.')

    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...MONSTER_TEST_INPUT,
          legendaryActionUses: 3,
          actions: [spellcastingAction],
          legendaryActions: [
            {
              id: 'cast',
              kind: 'spell',
              name: 'Cast',
              spellInvocation: 'use-entry',
              castingAbility: { kind: 'ability', ability: 'cha' },
              spells: [{ spellId: 'srd-cc-5.2.1:scorching-ray' }],
            },
          ],
        }),
      ),
    ).toContain('Choose a Spellcasting action.')
  })

  it('does not treat a legendary explicit ability as a spellcasting source', () => {
    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...MONSTER_TEST_INPUT,
          legendaryActionUses: 3,
          actions: [
            {
              id: 'misty-step',
              kind: 'spell',
              name: 'Misty Step',
              castingAbility: { kind: 'shared', entryId: 'beguile' },
              spells: [{ spellId: 'srd-cc-5.2.1:misty-step' }],
            },
          ],
          legendaryActions: [
            {
              id: 'beguile',
              kind: 'spell',
              name: 'Beguile',
              castingAbility: { kind: 'ability', ability: 'cha' },
              spells: [{ spellId: 'srd-cc-5.2.1:suggestion' }],
            },
          ],
        }),
      ),
    ).toContain('Shared spellcasting must use another spell entry that has its own ability.')
  })

  it('keeps action ids unique across legendary actions', () => {
    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...MONSTER_TEST_INPUT,
          legendaryActionUses: 3,
          actions: [BITE_ACTION],
          legendaryActions: [
            {
              id: 'bite',
              kind: 'special',
              name: 'Bite',
              description: '<p>The creature bites.</p>',
            },
          ],
        }),
      ),
    ).toContain('Action ids must be unique across all sections.')
  })
})
