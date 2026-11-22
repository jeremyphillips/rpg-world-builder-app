import { describe, expect, it } from 'vitest'

import {
  formatSavingThrowClauses,
  formatSavingThrowClausesProse,
} from '../creature/format-saving-throw'
import {
  joinStatBlockProseParagraph,
  joinStatBlockProsePlainText,
  monsterAttackActionPartsToProse,
  statBlockLeadSeparator,
  statBlockOutcomeLead,
  statBlockReactionLead,
} from './stat-block-prose'

describe('stat-block prose', () => {
  it('joins saving throw clauses to the legacy plain string', () => {
    const args = {
      abilityLabel: 'Dexterity',
      dc: 12,
      targets: 'each creature in a 15-foot Cone',
      failure: '17 (5d6) Fire damage',
      success: 'Half damage',
    }
    expect(joinStatBlockProsePlainText(formatSavingThrowClausesProse(args))).toBe(
      formatSavingThrowClauses(args),
    )
  })

  it('uses one colon from lead separator policy on attack prose', () => {
    const prose = monsterAttackActionPartsToProse({
      attackLabel: 'Melee Attack Roll',
      bonusAndDistance: '+4, reach 5 ft.',
      hitBody: '4 (1d4 + 2) Piercing damage',
    })
    expect(joinStatBlockProseParagraph(prose)).toBe(
      'Melee Attack Roll: +4, reach 5 ft. Hit: 4 (1d4 + 2) Piercing damage.',
    )
  })

  it('formats outcome and reaction leads with explicit spacing', () => {
    expect(
      joinStatBlockProseParagraph(statBlockOutcomeLead('Failure', 'The target takes 10 damage')),
    ).toBe('Failure: The target takes 10 damage.')
    expect(
      joinStatBlockProseParagraph(statBlockReactionLead('Trigger', 'A creature hits the monster.')),
    ).toBe('Trigger: A creature hits the monster.')
  })

  it('exposes stable separator lookup for treatments', () => {
    expect(statBlockLeadSeparator('inline')).toBe(':')
    expect(statBlockLeadSeparator('paragraph')).toBe(':')
  })
})
