import { describe, expect, expectTypeOf, it } from 'vitest'

import {
  createMonsterDraftInputSchema,
  createMonsterInputSchema,
  monsterActionDraftSchema,
  monsterActionSchema,
  monsterReactionDraftSchema,
  monsterReactionSchema,
  type MonsterReaction,
} from './monster'

describe('monsterActionSchema', () => {
  it('allows weapon actions without a name', () => {
    expect(
      monsterActionSchema.parse({
        id: 'dagger',
        kind: 'weapon',
        equipmentEntryId: 'dagger',
      }).name,
    ).toBeUndefined()
  })

  it('requires a name for natural-weapon actions', () => {
    expect(
      monsterActionSchema.safeParse({
        id: 'claw',
        kind: 'natural-weapon',
        mode: 'melee',
        properties: [],
        damage: { dice: { count: 1, faces: 4 } },
        damageType: 'slashing',
      }).success,
    ).toBe(false)
  })

  it('parses reaction triggers on reactions only', () => {
    expect(
      monsterReactionSchema.parse({
        id: 'parry',
        kind: 'special',
        name: 'Parry',
        description: '<p>Adds 2 to AC.</p>',
        trigger: { text: 'When hit' },
      }).trigger,
    ).toEqual({ text: 'When hit' })
  })

  it('keeps special reaction descriptions required', () => {
    expectTypeOf<
      Extract<MonsterReaction, { kind: 'special' }>['description']
    >().toEqualTypeOf<string>()
  })
})

describe('monsterBodySchema refinements', () => {
  const baseBody = {
    name: 'Test',
    sizes: ['medium'],
    creatureType: 'humanoid',
    alignment: 'n',
    abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    armorClass: {},
    hitPoints: { kind: 'hit-dice', count: 1 },
    movement: { walk: 30 },
    senses: [],
    communication: {},
    challengeRating: '0',
    proficiencies: { savingThrows: [], skills: [], languages: [], weapons: [] },
    defenses: {
      vulnerabilities: [],
      resistances: [],
      immunities: [],
      conditionImmunities: [],
    },
  } as const

  it('rejects duplicate action ids across sections', () => {
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'dup-actions',
        ...baseBody,
        actions: [{ id: 'shared', kind: 'special', name: 'A', description: 'a' }],
        reactions: [
          { id: 'shared', kind: 'special', name: 'B', description: 'b', trigger: { text: 't' } },
        ],
      }).success,
    ).toBe(false)
  })

  it('rejects legacy communication.languages on create input', () => {
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'legacy-languages',
        ...baseBody,
        communication: { languages: { entries: [{ language: 'common' }] } },
      }).success,
    ).toBe(false)
  })

  it('allows CR 0 XP override only when different from derived', () => {
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'cr-zero-override',
        ...baseBody,
        experiencePointsOverride: 0,
      }).success,
    ).toBe(true)

    expect(
      createMonsterInputSchema.safeParse({
        slug: 'xp-override-blocked',
        ...baseBody,
        challengeRating: '1/8',
        experiencePointsOverride: 0,
      }).success,
    ).toBe(false)
  })

  it('rejects duplicate trait ids on publish and draft', () => {
    const traits = [
      { id: 'pack', name: 'Pack', description: '<p>A</p>' },
      { id: 'pack', name: 'Pack again', description: '<p>B</p>' },
    ]
    expect(
      createMonsterInputSchema.safeParse({ slug: 'dup-traits', ...baseBody, traits }).success,
    ).toBe(false)
    expect(
      createMonsterDraftInputSchema.safeParse({ slug: 'dup-traits', ...baseBody, traits }).success,
    ).toBe(false)
  })

  it('rejects overlapping damage defenses on publish and allows them on a draft', () => {
    const defenses = {
      vulnerabilities: [],
      resistances: ['fire'],
      immunities: ['fire', 'poison'],
      conditionImmunities: ['poisoned'],
    }
    const published = createMonsterInputSchema.safeParse({
      slug: 'overlap',
      ...baseBody,
      defenses,
    })
    expect(published.success).toBe(false)
    if (!published.success) {
      expect(
        published.error.issues.some((issue) =>
          issue.message.includes('Fire is already a resistance'),
        ),
      ).toBe(true)
    }
    expect(
      createMonsterDraftInputSchema.safeParse({ slug: 'overlap', ...baseBody, defenses }).success,
    ).toBe(true)
  })
})

describe('monster spell entries', () => {
  const baseBody = {
    name: 'Test',
    sizes: ['medium'] as const,
    creatureType: 'humanoid',
    alignment: 'n' as const,
    abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    armorClass: {},
    hitPoints: { kind: 'hit-dice' as const, count: 1 },
    movement: { walk: 30 },
    senses: [],
    communication: {},
    challengeRating: '0' as const,
    proficiencies: { savingThrows: [], skills: [], languages: [], weapons: [] },
    defenses: {
      vulnerabilities: [],
      resistances: [],
      immunities: [],
      conditionImmunities: [],
    },
  }
  const spellcasting = {
    id: 'spellcasting',
    kind: 'spell' as const,
    name: 'Spellcasting',
    castingAbility: { kind: 'ability' as const, ability: 'int' as const },
    spells: [{ spellId: 'srd-cc-5.2.1:mage-hand' }],
  }

  it('accepts every kind in every section and an optional reaction trigger', () => {
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'kinds',
        ...baseBody,
        actions: [spellcasting],
        bonusActions: [{ id: 'note', kind: 'special', name: 'Note', description: '<p>n</p>' }],
        reactions: [{ ...spellcasting, id: 'react-spell' }],
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
        ...baseBody,
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
        ...baseBody,
        actions: [
          {
            ...spellcasting,
            spells: [{ spellId: 'srd-cc-5.2.1:mage-hand' }, { spellId: 'srd-cc-5.2.1:mage-hand' }],
          },
        ],
      }).success,
    ).toBe(false)
  })

  it('requires a shared ability target to be another spell entry with its own ability', () => {
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'shared',
        ...baseBody,
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
        ...baseBody,
        actions: [
          {
            ...spellcasting,
            castingAbility: { kind: 'shared', entryId: 'spellcasting' },
          },
        ],
      }).success,
    ).toBe(false)
  })

  it('keeps partial limited use on drafts and accepts published values', () => {
    const partial = {
      id: 'breath',
      kind: 'special' as const,
      limitedUse: { kind: 'recharge' as const },
    }
    expect(monsterActionDraftSchema.safeParse(partial).success).toBe(true)
    expect(monsterActionSchema.safeParse(partial).success).toBe(false)
    const published = monsterActionSchema.parse({
      id: 'breath',
      kind: 'special',
      name: 'Breath',
      description: '<p>Exhales.</p>',
      limitedUse: { kind: 'recharge', minRoll: 5 },
    })
    expect(monsterActionDraftSchema.parse(published)).toMatchObject(published)
  })

  it('uses the same keys for published and draft variants', () => {
    const keys = (schema: { options: readonly { shape: object }[] }) =>
      schema.options.map((option) => Object.keys(option.shape).sort())
    expect(keys(monsterActionDraftSchema)).toEqual(keys(monsterActionSchema))
    const reactionOptions = (schema: object) =>
      keys(schema as { options: readonly { shape: object }[] })
    expect(reactionOptions(monsterReactionDraftSchema)).toEqual(
      reactionOptions(monsterReactionSchema),
    )
  })
})

const publishedMonsterBase = {
  slug: 'test-monster',
  name: 'Test',
  sizes: ['medium'],
  creatureType: 'humanoid',
  alignment: 'n',
  abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  armorClass: {},
  hitPoints: { kind: 'hit-dice', count: 1 },
  movement: { walk: 30 },
  senses: [],
  communication: {},
  challengeRating: '0',
  proficiencies: { savingThrows: [], skills: [], languages: [], weapons: [] },
  defenses: {
    vulnerabilities: [],
    resistances: [],
    immunities: [],
    conditionImmunities: [],
  },
} as const

const biteAction = {
  id: 'bite',
  kind: 'natural-weapon',
  name: 'Bite',
  mode: 'melee',
  reach: 5,
  damage: { dice: { count: 1, faces: 6 } },
  damageType: 'piercing',
}

const fireDamage = {
  id: 'damage',
  kind: 'damage' as const,
  roll: { dice: { count: 2, faces: 6 } },
  damageType: 'fire',
}

const cone = { shape: 'cone' as const, length: { value: 15, unit: 'ft' as const } }

function saveAction(resolution: Record<string, unknown>) {
  return {
    id: 'breath',
    kind: 'save' as const,
    name: 'Fire Breath',
    dcSource: { kind: 'ability' as const, ability: 'con' as const, proficient: true },
    resolution,
  }
}

function issueMessages(result: {
  success: boolean
  error?: { issues: { path: PropertyKey[]; message: string }[] }
}) {
  return result.success ? [] : (result.error?.issues ?? []).map((issue) => issue.message)
}

describe('monster save and multiattack refinements', () => {
  it('accepts a multi-damage save and an unknown preset id', () => {
    const cold = { ...fireDamage, id: 'cold', damageType: 'cold' }
    const parsed = createMonsterInputSchema.safeParse({
      ...publishedMonsterBase,
      actions: [
        saveAction({
          selectionMode: 'self',
          areaOfEffect: cone,
          method: { kind: 'saving-throw', ability: 'dex' },
          effects: [fireDamage, cold],
          outcomes: [
            {
              result: 'failed-save',
              applications: [
                { effectId: 'damage', amount: 'full' },
                { effectId: 'cold', amount: 'full' },
              ],
            },
          ],
        }),
        { ...biteAction, preset: 'not-in-the-registry' },
      ],
    })
    expect(parsed.success).toBe(true)
  })

  it('rejects unsupported save shapes', () => {
    const cases = [
      saveAction({
        selectionMode: 'point',
        origin: { proximity: { kind: 'distance', distance: { value: 30, unit: 'ft' } } },
        areaOfEffect: cone,
        method: { kind: 'saving-throw', ability: 'dex' },
        effects: [fireDamage],
        outcomes: [
          { result: 'failed-save', applications: [{ effectId: 'damage', amount: 'full' }] },
        ],
      }),
      saveAction({
        selectionMode: 'none',
        method: { kind: 'saving-throw', ability: 'dex' },
        effects: [fireDamage],
        outcomes: [
          { result: 'failed-save', applications: [{ effectId: 'damage', amount: 'full' }] },
        ],
      }),
      saveAction({
        selectionMode: 'self',
        areaOfEffect: cone,
        method: { kind: 'saving-throw', ability: 'dex' },
        effects: [{ id: 'healing', kind: 'healing', roll: { dice: { count: 1, faces: 8 } } }],
        outcomes: [
          { result: 'failed-save', applications: [{ effectId: 'healing', amount: 'full' }] },
        ],
      }),
      saveAction({
        selectionMode: 'self',
        areaOfEffect: cone,
        method: { kind: 'saving-throw', ability: 'dex' },
        effects: [
          {
            id: 'temporary-hit-points',
            kind: 'temporary-hit-points',
            roll: { dice: { count: 1, faces: 4 } },
          },
        ],
        outcomes: [
          {
            result: 'failed-save',
            applications: [{ effectId: 'temporary-hit-points', amount: 'full' }],
          },
        ],
      }),
      saveAction({
        selectionMode: 'self',
        areaOfEffect: cone,
        method: { kind: 'automatic' },
        effects: [fireDamage],
        outcomes: [{ result: 'applied', applications: [{ effectId: 'damage', amount: 'full' }] }],
      }),
    ]
    const messages = [
      'Saving throw actions select an area from self or creatures in reach or at a distance.',
      'Saving throw actions select an area from self or creatures in reach or at a distance.',
      'Saving throw actions can only deal damage.',
      'Saving throw actions can only deal damage.',
      'Saving throw actions require a saving throw.',
    ]
    cases.forEach((action, index) => {
      const parsed = createMonsterInputSchema.safeParse({
        ...publishedMonsterBase,
        actions: [action],
      })
      expect(issueMessages(parsed)).toContain(messages[index])
    })
  })

  it('rejects broken multiattack references and allows an empty draft', () => {
    const multiattack = (steps: { count?: number; actionIds: string[] }[], id = 'multi') => ({
      id,
      kind: 'multiattack' as const,
      name: 'Multiattack',
      steps,
    })
    const save = saveAction({
      selectionMode: 'self',
      areaOfEffect: cone,
      method: { kind: 'saving-throw', ability: 'dex' },
      effects: [fireDamage],
      outcomes: [{ result: 'failed-save', applications: [{ effectId: 'damage', amount: 'full' }] }],
    })

    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...publishedMonsterBase,
          actions: [biteAction, multiattack([{ count: 1, actionIds: ['missing'] }])],
        }),
      ),
    ).toContain('must reference an action in Actions')

    expect(
      createMonsterDraftInputSchema.safeParse({
        ...publishedMonsterBase,
        actions: [multiattack([])],
      }).success,
    ).toBe(true)
    expect(
      createMonsterInputSchema.safeParse({
        ...publishedMonsterBase,
        actions: [multiattack([])],
      }).success,
    ).toBe(false)

    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...publishedMonsterBase,
          actions: [biteAction, multiattack([{ count: 2, actionIds: ['bite', 'bite'] }])],
        }),
      ),
    ).toContain('Each attack can be referenced only once.')

    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...publishedMonsterBase,
          actions: [
            biteAction,
            multiattack([
              { count: 1, actionIds: ['bite'] },
              { count: 1, actionIds: ['bite'] },
            ]),
          ],
        }),
      ),
    ).toContain('Each attack can be referenced only once.')

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
        ...publishedMonsterBase,
        actions: [extra, multiattack([{ count: 1, actionIds: [extra.id] }])],
      })
      expect(issueMessages(parsed)).toContain('invalid kind')
    }

    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...publishedMonsterBase,
          actions: [multiattack([{ count: 1, actionIds: ['bite'] }])],
          bonusActions: [biteAction],
        }),
      ),
    ).toContain('must reference an action in Actions')

    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...publishedMonsterBase,
          bonusActions: [multiattack([{ count: 1, actionIds: ['bite'] }])],
          actions: [biteAction],
        }),
      ),
    ).toContain('Multiattack is only valid in Actions.')

    expect(
      issueMessages(
        createMonsterInputSchema.safeParse({
          ...publishedMonsterBase,
          actions: [multiattack([{ count: 1, actionIds: ['multi'] }])],
        }),
      ),
    ).toContain('A multiattack cannot reference itself.')
  })
})

describe('monsterActionDraftSchema', () => {
  it('keeps partial damage dice that publish rejects', () => {
    const partial = {
      id: 'claw',
      kind: 'natural-weapon',
      name: 'Claw',
      damage: { dice: { count: 1 } },
    }
    expect(monsterActionDraftSchema.safeParse(partial).success).toBe(true)
    expect(monsterActionSchema.safeParse(partial).success).toBe(false)
  })
})
