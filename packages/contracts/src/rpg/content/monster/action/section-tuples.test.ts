import { describe, expect, expectTypeOf, it } from 'vitest'

import { monsterActionPlacementMessage } from './section-placement'
import {
  MONSTER_SECTION_KINDS,
  monsterActionDraftSchema,
  monsterActionSchema,
  monsterBonusActionSchema,
  monsterLegendaryActionSchema,
  monsterReactionSchema,
} from './section-tuples'
import type { MonsterAction } from './actions-schema'

const EXPECTED_SECTION_KINDS = {
  actions: [
    'weapon',
    'natural-weapon',
    'attack',
    'save',
    'spell',
    'special',
    'multiattack',
    'shape-shift',
    'teleport',
  ],
  bonusActions: [
    'attack',
    'save',
    'spell',
    'special',
    'leap',
    'teleport',
    'take-actions',
    'shape-shift',
  ],
  reactions: ['spell', 'special', 'action-reference', 'parry'],
  legendaryActions: ['action-reference', 'spell', 'special', 'save'],
} as const

describe('MONSTER_SECTION_KINDS', () => {
  it('matches each section union tuple', () => {
    expect(MONSTER_SECTION_KINDS).toEqual(EXPECTED_SECTION_KINDS)
    const publishedSchemas = {
      actions: monsterActionSchema,
      bonusActions: monsterBonusActionSchema,
      reactions: monsterReactionSchema,
      legendaryActions: monsterLegendaryActionSchema,
    } as const
    for (const section of Object.keys(
      EXPECTED_SECTION_KINDS,
    ) as (keyof typeof EXPECTED_SECTION_KINDS)[]) {
      const options = publishedSchemas[section].options.map(
        (option) => option.shape.kind.value as string,
      )
      expect(options).toEqual(EXPECTED_SECTION_KINDS[section])
    }
  })
})

describe('section placement', () => {
  it('parses teleport on Actions and rejects parry with a placement message', () => {
    const teleport = {
      id: 'tp',
      kind: 'teleport' as const,
      name: 'Teleport',
      distanceFeet: 60,
    }
    expect(monsterActionSchema.parse(teleport)).toMatchObject(teleport)
    expect(monsterActionDraftSchema.parse({ ...teleport, distanceFeet: undefined })).toMatchObject({
      kind: 'teleport',
    })
    const parryOnActions = monsterActionSchema.safeParse({
      id: 'parry',
      kind: 'parry',
      name: 'Parry',
      acBonus: 2,
    })
    expect(parryOnActions.success).toBe(false)
    expect(
      parryOnActions.error?.issues.some(
        (issue) => issue.message === monsterActionPlacementMessage('parry', 'actions'),
      ),
    ).toBe(true)
    const teleportOnReactions = monsterReactionSchema.safeParse(teleport)
    expect(teleportOnReactions.success).toBe(false)
    expect(
      teleportOnReactions.error?.issues.some(
        (issue) => issue.message === monsterActionPlacementMessage('teleport', 'reactions'),
      ),
    ).toBe(true)
  })

  it('rejects zero distance on an allowed teleport', () => {
    const result = monsterActionSchema.safeParse({
      id: 'tp',
      kind: 'teleport',
      name: 'Teleport',
      distanceFeet: 0,
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues.some((issue) => issue.path.at(-1) === 'distanceFeet')).toBe(true)
  })
})

describe('section tuple types', () => {
  it('excludes parry from Actions and allows reaction reference without trigger', () => {
    expectTypeOf<Extract<MonsterAction, { kind: 'parry' }>>().toEqualTypeOf<never>()
    expect(
      monsterReactionSchema.safeParse({
        id: 'ref',
        kind: 'action-reference',
        actionIds: ['bite'],
      }).success,
    ).toBe(true)
  })
})
