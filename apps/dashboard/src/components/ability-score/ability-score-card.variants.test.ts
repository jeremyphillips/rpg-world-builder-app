import { describe, expect, it } from 'vitest'

import {
  abilityScoreCardScoreRowVariants,
  abilityScoreCardScoreSlotMinHeightClassesFor,
  abilityScoreCardScoreValueClassesFor,
  abilityScoreCardSelectFilledClusterClasses,
} from './ability-score-card.variants'

describe('abilityScoreCardScoreValueClassesFor', () => {
  it('uses heading-3 scale for sm and ability-score-md for md', () => {
    expect(abilityScoreCardScoreValueClassesFor('sm')).toContain('var(--text-heading-3)')
    expect(abilityScoreCardScoreValueClassesFor('md')).toContain('var(--text-ability-score-md)')
  })
})

describe('abilityScoreCardScoreRowVariants', () => {
  it('uses flex end alignment and wider gap for stepper layout', () => {
    expect(abilityScoreCardScoreRowVariants({ layout: 'stepper' })).toContain('justify-end')
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
      '--text-heading-3--line-height',
    )
    expect(abilityScoreCardScoreSlotMinHeightClassesFor('md')).toContain(
      '--text-ability-score-md--line-height',
    )
  })
})
