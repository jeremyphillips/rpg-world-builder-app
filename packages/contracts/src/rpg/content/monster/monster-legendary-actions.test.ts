import { describe, expect, it } from 'vitest'

import {
  createMonsterInputSchema,
  monsterActionSchema,
  monsterLegendaryActionDraftSchema,
  monsterLegendaryActionSchema,
  monsterReactionSchema,
} from '../monster'
import { BITE_ACTION, MONSTER_TEST_INPUT, issueMessages } from './test-fixtures'

function legendaryBlock(
  actions: unknown[],
  uses?: { normal?: number; inLair?: number },
): { uses?: { normal?: number; inLair?: number }; actions: unknown[] } {
  return {
    ...(uses !== undefined ? { uses } : {}),
    actions,
  }
}

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
  it('accepts a reference, spell, save, or custom ability', () => {
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
    for (const kind of ['weapon', 'multiattack'] as const) {
      expect(monsterLegendaryActionSchema.safeParse({ id: 'row', kind, name: 'Row' }).success).toBe(
        false,
      )
    }
    expect(monsterActionSchema.safeParse(reference).success).toBe(false)
    expect(monsterReactionSchema.safeParse(reference).success).toBe(true)
    expect(
      monsterLegendaryActionDraftSchema.safeParse({ ...reference, actionIds: [] }).success,
    ).toBe(true)
    expect(
      monsterLegendaryActionSchema.safeParse({
        id: 'disrupt-life',
        kind: 'save',
        name: 'Disrupt Life',
        onceUntilNextTurn: true,
        dcSource: { kind: 'ability', ability: 'con', proficient: true },
        resolution: {
          selectionMode: 'self',
          areaOfEffect: { shape: 'emanation', radius: { value: 20, unit: 'ft' } },
          method: { kind: 'saving-throw', ability: 'con' },
          effects: [
            {
              id: 'damage',
              kind: 'damage',
              roll: { dice: { count: 9, faces: 6 } },
              damageType: 'necrotic',
            },
          ],
          outcomes: [
            {
              result: 'failed-save',
              effects: [{ kind: 'effect-reference', effectId: 'damage', amount: 'full' }],
            },
            {
              result: 'successful-save',
              effects: [{ kind: 'effect-reference', effectId: 'damage', amount: 'half' }],
            },
          ],
        },
      }).success,
    ).toBe(true)
  })

  it('requires a uses pool only when legendary rows exist', () => {
    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...MONSTER_TEST_INPUT,
          actions: [BITE_ACTION],
          legendaryActions: legendaryBlock([reference]),
        }),
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/Enter legendary action uses|expected object/),
      ]),
    )

    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...MONSTER_TEST_INPUT,
          legendaryActions: legendaryBlock([], { normal: 3 }),
        }),
      ),
    ).toContain('Legendary action uses require a legendary action.')

    expect(
      createMonsterInputSchema.safeParse({
        ...MONSTER_TEST_INPUT,
        actions: [BITE_ACTION],
        legendaryActions: legendaryBlock(
          [
            {
              ...reference,
              movement: { allowance: 'half-speed' },
            },
          ],
          { normal: 3, inLair: 4 },
        ),
      }).success,
    ).toBe(true)
  })

  it('rejects an in-lair legendary pool at or below normal', () => {
    const base = {
      ...MONSTER_TEST_INPUT,
      actions: [BITE_ACTION],
      legendaryActions: legendaryBlock([reference], { normal: 3, inLair: 3 }),
    }
    expect(createMonsterInputSchema.safeParse(base).success).toBe(false)
    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...base,
          legendaryActions: legendaryBlock([reference], { normal: 4, inLair: 3 }),
        }),
      ),
    ).toContain('In-lair uses must be greater than normal uses.')
  })

  it('requires exactly one spell and keeps use-entry inside Legendary Actions', () => {
    expect(
      createMonsterInputSchema.safeParse({
        ...MONSTER_TEST_INPUT,
        actions: [spellcastingAction],
        legendaryActions: legendaryBlock([legendarySpell('srd-cc-5.2.1:fear')], { normal: 3 }),
      }).success,
    ).toBe(true)

    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...MONSTER_TEST_INPUT,
          actions: [spellcastingAction],
          legendaryActions: legendaryBlock(
            [
              {
                ...legendarySpell('srd-cc-5.2.1:fear'),
                spells: [
                  { spellId: 'srd-cc-5.2.1:fear' },
                  { spellId: 'srd-cc-5.2.1:scorching-ray' },
                ],
              },
            ],
            { normal: 3 },
          ),
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
        actions: [spellcastingAction],
        legendaryActions: legendaryBlock(
          [legendarySpell('srd-cc-5.2.1:scorching-ray', 3, 'use-entry')],
          { normal: 3 },
        ),
      }).success,
    ).toBe(true)

    expect(
      createMonsterInputSchema.safeParse({
        ...MONSTER_TEST_INPUT,
        actions: [spellcastingAction],
        legendaryActions: legendaryBlock(
          [legendarySpell('srd-cc-5.2.1:scorching-ray', undefined, 'use-entry')],
          { normal: 3 },
        ),
      }).success,
    ).toBe(true)

    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...MONSTER_TEST_INPUT,
          actions: [spellcastingAction],
          legendaryActions: legendaryBlock(
            [legendarySpell('srd-cc-5.2.1:fear', undefined, 'use-entry')],
            { normal: 3 },
          ),
        }),
      ),
    ).toContain("This spell isn't on the selected Spellcasting action.")

    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...MONSTER_TEST_INPUT,
          actions: [spellcastingAction],
          legendaryActions: legendaryBlock(
            [legendarySpell('srd-cc-5.2.1:scorching-ray', 2, 'use-entry')],
            { normal: 3 },
          ),
        }),
      ),
    ).toContain('Cast level must match the Spellcasting action.')

    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...MONSTER_TEST_INPUT,
          legendaryActions: legendaryBlock(
            [legendarySpell('srd-cc-5.2.1:scorching-ray', 3, 'use-entry')],
            { normal: 3 },
          ),
        }),
      ),
    ).toContain('Shared spellcasting must use another spell entry that has its own ability.')

    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...MONSTER_TEST_INPUT,
          actions: [spellcastingAction],
          legendaryActions: legendaryBlock(
            [
              {
                id: 'cast',
                kind: 'spell',
                name: 'Cast',
                spellInvocation: 'use-entry',
                castingAbility: { kind: 'ability', ability: 'cha' },
                spells: [{ spellId: 'srd-cc-5.2.1:scorching-ray' }],
              },
            ],
            { normal: 3 },
          ),
        }),
      ),
    ).toContain('Choose a Spellcasting action.')
  })

  it('does not treat a legendary explicit ability as a spellcasting source', () => {
    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...MONSTER_TEST_INPUT,
          actions: [
            {
              id: 'misty-step',
              kind: 'spell',
              name: 'Misty Step',
              castingAbility: { kind: 'shared', entryId: 'beguile' },
              spells: [{ spellId: 'srd-cc-5.2.1:misty-step' }],
            },
          ],
          legendaryActions: legendaryBlock(
            [
              {
                id: 'beguile',
                kind: 'spell',
                name: 'Beguile',
                castingAbility: { kind: 'ability', ability: 'cha' },
                spells: [{ spellId: 'srd-cc-5.2.1:suggestion' }],
              },
            ],
            { normal: 3 },
          ),
        }),
      ),
    ).toContain('Shared spellcasting must use another spell entry that has its own ability.')
  })

  it('keeps action ids unique across legendary actions', () => {
    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...MONSTER_TEST_INPUT,
          actions: [BITE_ACTION],
          legendaryActions: legendaryBlock(
            [
              {
                id: 'bite',
                kind: 'special',
                name: 'Bite',
                description: '<p>The creature bites.</p>',
              },
            ],
            { normal: 3 },
          ),
        }),
      ),
    ).toContain('Action ids must be unique across all sections.')
  })
})
