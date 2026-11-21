import { describe, expect, it } from 'vitest'

import { createMonsterDraftInputSchema, createMonsterInputSchema } from '../monster'
import {
  BITE_ACTION,
  CONE_AREA,
  FIRE_DAMAGE,
  MONSTER_TEST_INPUT,
  issueMessages,
  monsterSaveAction,
} from './test-fixtures'

describe('monster action references', () => {
  it('rejects broken multiattack references and allows an empty draft', () => {
    const multiattack = (steps: { count?: number; actionIds: string[] }[], id = 'multi') => ({
      id,
      kind: 'multiattack' as const,
      name: 'Multiattack',
      steps,
    })
    const save = monsterSaveAction({
      selectionMode: 'self',
      areaOfEffect: CONE_AREA,
      method: { kind: 'saving-throw', ability: 'dex' },
      effects: [FIRE_DAMAGE],
      outcomes: [
        {
          result: 'failed-save',
          effects: [{ kind: 'effect-reference', effectId: 'damage', amount: 'full' }],
        },
      ],
    })

    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...MONSTER_TEST_INPUT,
          actions: [BITE_ACTION, multiattack([{ count: 1, actionIds: ['missing'] }])],
        }),
      ),
    ).toContain('This attack is no longer available. Select another.')

    expect(
      createMonsterDraftInputSchema.safeParse({
        ...MONSTER_TEST_INPUT,
        actions: [multiattack([])],
      }).success,
    ).toBe(true)
    expect(
      createMonsterInputSchema.safeParse({
        ...MONSTER_TEST_INPUT,
        actions: [multiattack([])],
      }).success,
    ).toBe(false)

    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...MONSTER_TEST_INPUT,
          actions: [BITE_ACTION, multiattack([{ count: 2, actionIds: ['bite', 'bite'] }])],
        }),
      ),
    ).toContain('This attack is already selected.')

    expect(
      createMonsterInputSchema.safeParse({
        ...MONSTER_TEST_INPUT,
        actions: [
          BITE_ACTION,
          multiattack([
            { count: 1, actionIds: ['bite'] },
            { count: 1, actionIds: ['bite'] },
          ]),
        ],
      }).success,
    ).toBe(true)

    for (const extra of [
      save,
      {
        id: 'spell',
        kind: 'spell',
        name: 'Spells',
        castingAbility: { kind: 'ability', ability: 'int' },
        spells: [{ spellId: 'srd:fire-bolt' }],
      },
      { id: 'special', kind: 'special', name: 'Special', description: 'A trick.' },
      multiattack([{ count: 1, actionIds: ['other-multi'] }], 'other-multi'),
    ]) {
      const parsed = createMonsterInputSchema.safeParse({
        ...MONSTER_TEST_INPUT,
        actions: [extra, multiattack([{ count: 1, actionIds: [extra.id] }])],
      })
      expect(issueMessages(parsed)).toContain('Select an action that can be used as an attack.')
    }

    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...MONSTER_TEST_INPUT,
          actions: [multiattack([{ count: 1, actionIds: ['bite'] }])],
          bonusActions: [{ id: 'bite', kind: 'special', name: 'Bite', description: 'A bite.' }],
        }),
      ),
    ).toContain('This attack is no longer available. Select another.')

    expect(
      createMonsterInputSchema.safeParse({
        ...MONSTER_TEST_INPUT,
        bonusActions: [multiattack([{ count: 1, actionIds: ['bite'] }])],
        actions: [BITE_ACTION],
      }).success,
    ).toBe(false)

    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...MONSTER_TEST_INPUT,
          actions: [multiattack([{ count: 1, actionIds: ['multi'] }])],
        }),
      ),
    ).toContain('A multiattack cannot reference itself.')
  })

  it('checks legendary action references against Actions', () => {
    const reference = (actionIds: string[]) => ({
      id: 'pounce',
      kind: 'action-reference' as const,
      name: 'Pounce',
      actionIds,
    })
    const save = monsterSaveAction({
      selectionMode: 'self',
      areaOfEffect: CONE_AREA,
      method: { kind: 'saving-throw', ability: 'dex' },
      effects: [FIRE_DAMAGE],
      outcomes: [
        {
          result: 'failed-save',
          effects: [{ kind: 'effect-reference', effectId: 'damage', amount: 'full' }],
        },
      ],
    })
    const special = { id: 'glare', kind: 'special', name: 'Dreadful Glare', description: 'A gaze.' }
    const withPool = (actions: unknown[], legendaryActions: unknown[], bonusActions?: unknown[]) =>
      createMonsterInputSchema.safeParse({
        ...MONSTER_TEST_INPUT,
        actions,
        ...(bonusActions ? { bonusActions } : {}),
        legendaryActions: { uses: 3, actions: legendaryActions },
      })

    expect(issueMessages(withPool([BITE_ACTION], [reference([])]))).toContain(
      'Choose an attack or ability from Actions.',
    )
    expect(
      issueMessages(withPool([BITE_ACTION], [reference(['missing'])])).some((message) =>
        message.includes('Choose an attack or ability from Actions.'),
      ),
    ).toBe(true)
    expect(
      issueMessages(
        withPool(
          [],
          [reference(['bite'])],
          [{ id: 'bite', kind: 'special', name: 'Bite', description: 'A bite.' }],
        ),
      ),
    ).toContain('Choose an attack or ability from Actions.')
    expect(
      issueMessages(
        withPool(
          [
            BITE_ACTION,
            {
              id: 'multi',
              kind: 'multiattack',
              name: 'Multiattack',
              steps: [{ count: 1, actionIds: ['bite'] }],
            },
          ],
          [reference(['multi'])],
        ),
      ),
    ).toContain("This action can't be used by a legendary action.")
    expect(
      issueMessages(
        withPool(
          [
            {
              id: 'spell',
              kind: 'spell',
              name: 'Spells',
              castingAbility: { kind: 'ability', ability: 'int' },
              spells: [{ spellId: 'srd:fire-bolt' }],
            },
          ],
          [reference(['spell'])],
        ),
      ),
    ).toContain("This action can't be used by a legendary action.")
    expect(issueMessages(withPool([save, BITE_ACTION], [reference(['breath', 'bite'])]))).toContain(
      'Only attacks can be offered as a choice.',
    )
    expect(issueMessages(withPool([special], [reference(['glare'])]))).toEqual(
      expect.not.arrayContaining(['Only attacks can be offered as a choice.']),
    )
    expect(issueMessages(withPool([BITE_ACTION], [reference(['bite', 'bite'])]))).toContain(
      'Each action can be chosen only once.',
    )
    expect(
      createMonsterDraftInputSchema.safeParse({
        ...MONSTER_TEST_INPUT,
        legendaryActions: { actions: [{ ...reference([]), actionIds: [] }] },
      }).success,
    ).toBe(true)
  })

  it('publishes a valid reference without a stored name', () => {
    expect(
      createMonsterInputSchema.safeParse({
        ...MONSTER_TEST_INPUT,
        actions: [BITE_ACTION],
        legendaryActions: {
          uses: 3,
          actions: [{ id: 'pounce', kind: 'action-reference', actionIds: ['bite'] }],
        },
      }).success,
    ).toBe(true)
    expect(
      createMonsterInputSchema.safeParse({
        ...MONSTER_TEST_INPUT,
        actions: [BITE_ACTION],
        reactions: [
          {
            id: 'reflex',
            kind: 'action-reference',
            actionIds: ['bite'],
            trigger: { text: 'The creature is hit by an attack.' },
          },
        ],
      }).success,
    ).toBe(true)
    expect(
      createMonsterInputSchema.safeParse({
        ...MONSTER_TEST_INPUT,
        actions: [{ id: 'slash', kind: 'attack' }],
      }).success,
    ).toBe(false)
    expect(
      createMonsterInputSchema.safeParse({
        ...MONSTER_TEST_INPUT,
        actions: [{ id: 'notes', kind: 'special' }],
      }).success,
    ).toBe(false)
    expect(
      createMonsterInputSchema.safeParse({
        ...MONSTER_TEST_INPUT,
        actions: [
          {
            id: 'cast',
            kind: 'spell',
            castingAbility: { kind: 'ability', ability: 'int' },
            spells: [{ spellId: 'srd:fire-bolt' }],
          },
        ],
      }).success,
    ).toBe(false)
    expect(
      createMonsterInputSchema.safeParse({
        ...MONSTER_TEST_INPUT,
        reactions: [{ id: 'parry', kind: 'parry', acBonus: 2 }],
      }).success,
    ).toBe(false)
  })
})
