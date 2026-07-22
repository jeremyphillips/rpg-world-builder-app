import { describe, expect, it } from 'vitest'

import type { SkillProficiency } from '../skill-proficiency'
import { buildSkillProficiencyCompactSummary } from './skill-proficiency-compact-display'

const athletics = {
  id: 'srd-cc-5.2.1:athletics',
  slug: 'athletics',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Athletics',
  ability: 'str',
  examples: ['Jump farther than normal', 'Stay afloat in rough water', 'Break something'],
} satisfies SkillProficiency

describe('buildSkillProficiencyCompactSummary', () => {
  it('returns ability label and all catalog examples', () => {
    expect(buildSkillProficiencyCompactSummary(athletics)).toEqual({
      abilityLabel: 'Strength',
      exampleUses: athletics.examples,
    })
  })
})
