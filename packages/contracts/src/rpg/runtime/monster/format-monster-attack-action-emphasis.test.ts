import { describe, expect, it } from 'vitest'

import {
  formatMonsterAttackAction,
  monsterAttackActionSentenceParts,
} from './format-monster-attack-action'

const mixedLine = {
  attackBonusLabel: '+4',
  damage: '4',
  damageExpression: '1d4 + 2',
  damageTypeId: 'piercing',
  modes: ['melee', 'ranged'] as const,
  reach: 5,
  range: { normal: 20, long: 60 },
}

describe('monsterAttackActionSentenceParts emphasis', () => {
  it('matches the joined sentence and splits attack label and hit body', () => {
    const parts = monsterAttackActionSentenceParts({ ...mixedLine, modes: [...mixedLine.modes] })
    const sentence = formatMonsterAttackAction({ ...mixedLine, modes: [...mixedLine.modes] })
    expect(parts?.attackLabel).toBe('Melee or Ranged Attack Roll')
    expect(parts?.hitBody).toContain('4 (1d4 + 2) Piercing damage')
    expect(sentence).toContain('Melee or Ranged Attack Roll')
    expect(sentence).toContain('Hit:')
  })
})
