import { describe, expect, it } from 'vitest'

import { abilityScoreCardScoreValueClassesFor } from './ability-score-card.variants'

describe('abilityScoreCardScoreValueClassesFor', () => {
  it('uses heading-3 scale for sm and ability-score-md for md', () => {
    expect(abilityScoreCardScoreValueClassesFor('sm')).toContain('var(--text-heading-3)')
    expect(abilityScoreCardScoreValueClassesFor('md')).toContain('var(--text-ability-score-md)')
  })
})
