import { describe, expect, it } from 'vitest'

import {
  abilityScoreCardScoreRowVariants,
  abilityScoreCardScoreSectionVariants,
  abilityScoreCardScoreSlotMinHeightClassesFor,
  abilityScoreCardScoreValueClassesFor,
  abilityScoreCardSelectFilledClusterClasses,
} from './ability-score-card.variants'

describe('abilityScoreCardScoreValueClassesFor', () => {
  it('uses ability-score-sm for sm and ability-score-md for md', () => {
    expect(abilityScoreCardScoreValueClassesFor('sm')).toContain('var(--text-ability-score-sm)')
    expect(abilityScoreCardScoreValueClassesFor('md')).toContain('var(--text-ability-score-md)')
  })
})

describe('abilityScoreCardScoreSectionVariants', () => {
  it('omits score-to-modifier gap in stepper layout', () => {
    expect(abilityScoreCardScoreSectionVariants({ layout: 'stepper' })).toContain('gap-0')
    expect(abilityScoreCardScoreSectionVariants({ layout: 'stepper' })).not.toContain('gap-2')
  })

  it('keeps gap-2 between score and modifier for centered layout', () => {
    expect(abilityScoreCardScoreSectionVariants({ layout: 'centered' })).toContain('gap-2')
  })
})

describe('abilityScoreCardScoreRowVariants', () => {
  it('centers the score and stepper cluster with gap-2', () => {
    expect(abilityScoreCardScoreRowVariants({ layout: 'stepper' })).toContain('justify-center')
    expect(abilityScoreCardScoreRowVariants({ layout: 'stepper' })).toContain('gap-2')
  })

  it('centers select-filled layout without absolute positioning on the row', () => {
    const classes = abilityScoreCardScoreRowVariants({ layout: 'select-filled' })
    expect(classes).toContain('justify-center')
    expect(classes).not.toContain('relative')
  })
})

describe('abilityScoreCardSelectFilledClusterClasses', () => {
  it('uses symmetric compact lanes so the numeral stays card-centered', () => {
    expect(abilityScoreCardSelectFilledClusterClasses).toContain('inline-grid')
    expect(abilityScoreCardSelectFilledClusterClasses).toContain(
      'grid-cols-[var(--control-action-compact-height)_auto_var(--control-action-compact-height)]',
    )
  })
})

describe('abilityScoreCardScoreSlotMinHeightClassesFor', () => {
  it('ties min height to score typography line heights', () => {
    expect(abilityScoreCardScoreSlotMinHeightClassesFor('sm')).toContain(
      '--text-ability-score-sm--line-height',
    )
    expect(abilityScoreCardScoreSlotMinHeightClassesFor('md')).toContain(
      '--text-ability-score-md--line-height',
    )
  })
})
