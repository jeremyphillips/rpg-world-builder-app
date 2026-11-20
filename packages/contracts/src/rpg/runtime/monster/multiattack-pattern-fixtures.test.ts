import { describe, expect, it } from 'vitest'

import type { MonsterAction, MonsterBonusAction } from '../../content/monster/action/index'
import { createMonsterInputSchema } from '../../content/monster'
import { MONSTER_TEST_BODY, issueMessages } from '../../content/monster/test-fixtures'

import { formatMonsterMultiattackResult } from './format-monster-multiattack'
import {
  MULTIATTACK_PATTERN_CLASSES,
  MULTIATTACK_PATTERN_FIXTURES,
} from './multiattack-pattern-fixtures.data'

const emptyEquipmentCatalog = new Map() as never

describe('Multiattack pattern fixtures', () => {
  it('covers each structural pattern class exactly once', () => {
    expect(MULTIATTACK_PATTERN_FIXTURES).toHaveLength(MULTIATTACK_PATTERN_CLASSES.length)
    const classes = new Set(MULTIATTACK_PATTERN_FIXTURES.map((fixture) => fixture.patternClass))
    expect([...classes].sort()).toEqual([...MULTIATTACK_PATTERN_CLASSES].sort())
  })

  it.each(MULTIATTACK_PATTERN_FIXTURES)('$patternClass ($id)', (fixture) => {
    const published = createMonsterInputSchema.safeParse({
      ...MONSTER_TEST_BODY,
      name: fixture.monsterName,
      slug: fixture.slug,
      actions: [...fixture.peerActions, fixture.multiattack] as MonsterAction[],
      bonusActions: (fixture.bonusActions ?? []) as MonsterBonusAction[],
    })
    expect(published.success, issueMessages(published).join('; ')).toBe(true)

    const result = formatMonsterMultiattackResult({
      monsterName: fixture.monsterName,
      action: fixture.multiattack,
      actions: [...fixture.peerActions, fixture.multiattack],
      bonusActions: fixture.bonusActions ?? [],
      equipment: [],
      equipmentCatalog: emptyEquipmentCatalog,
      spellsById: fixture.spellsById,
      spellCatalogStatus: fixture.spellsById ? 'ready' : 'unavailable',
    } as Parameters<typeof formatMonsterMultiattackResult>[0])
    expect(result.status).toBe('ready')
    if (result.status !== 'ready') return
    expect(result.sentence).toBe(fixture.expectedSentence)
    expect(result.sentence).not.toMatch(/\b[a-f0-9-]{8,}\b/i)
  })
})
