import { describe, expect, it } from 'vitest'

import {
  abilityScoreCardScoreRowVariants,
  abilityScoreCardScoreSectionVariants,
  abilityScoreCardScoreSlotMinHeightClassesFor,
  abilityScoreCardScoreValueClassesFor,
  abilityScoreCardSelectFilledClusterClasses,
} from './ability-score-card.variants'

describe('abilityScoreCardScoreValueClassesFor', () => {
  it('uses the score base with a size modifier', () => {
    expect(abilityScoreCardScoreValueClassesFor('sm')).toBe('text-style-score text-style-score--sm')
    expect(abilityScoreCardScoreValueClassesFor('md')).toBe('text-style-score text-style-score--md')
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
  it('centers the score and stepper cluster with gap-2 inside a relative row', () => {
    const classes = abilityScoreCardScoreRowVariants({ layout: 'stepper' })
    expect(classes).toContain('relative')
    expect(classes).toContain('justify-center')
    expect(classes).toContain('gap-2')
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
      '--text-score-sm--line-height',
    )
    expect(abilityScoreCardScoreSlotMinHeightClassesFor('md')).toContain(
      '--text-score-md--line-height',
    )
  })
})
