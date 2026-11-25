import { describe, expect, it } from 'vitest'

import {
  formatSpiderClimbRuleClause,
  getCreatureTraitPresetSentence,
  SPIDER_CLIMB_RULE_TAIL,
} from '../../content/creature/trait-presets'
import { formatMonsterStatBlockSubject } from './spell-entry-presentation'

import { formatMonsterPresetTrait } from './format-monster-preset-trait'

describe('formatMonsterPresetTrait', () => {
  it('keeps the spider climb rule tail in one source', () => {
    expect(SPIDER_CLIMB_RULE_TAIL).toBe(
      ' can climb difficult surfaces, including along ceilings, without needing to make an ability check.',
    )
    const subject = 'the swarm of insects'
    expect(formatSpiderClimbRuleClause(subject)).toBe(`${subject}${SPIDER_CLIMB_RULE_TAIL}`)
    expect(getCreatureTraitPresetSentence('spider-climb', subject)).toContain(
      SPIDER_CLIMB_RULE_TAIL,
    )
  })

  it('formats spider climb from movement availability', () => {
    const subject = formatMonsterStatBlockSubject('Swarm of Insects')
    const trait = { id: 'climb', preset: 'spider-climb' as const }
    const unconditional = formatMonsterPresetTrait(subject, trait, {
      movement: { walk: 20, climb: 20 },
    })?.sentence
    expect(unconditional).toBe(getCreatureTraitPresetSentence('spider-climb', subject))
    expect(unconditional).not.toMatch(/^If /)

    const absent = formatMonsterPresetTrait(subject, trait, { movement: { walk: 20 } })?.sentence
    expect(absent).toBe(unconditional)

    const conditional = formatMonsterPresetTrait(subject, trait, {
      movement: { walk: 20 },
      movementAlternative: { modes: ['climb', 'fly'], feet: 20 },
    })?.sentence
    expect(conditional).toBe(
      `If ${subject} has a Climb Speed, ${formatSpiderClimbRuleClause(subject)}`,
    )
  })
})
