import { describe, expect, it } from 'vitest'

import { mapSkillProficiencyCompactSummaryToMetadataLines } from './map-skill-proficiency-compact-summary-to-metadata-lines'

describe('mapSkillProficiencyCompactSummaryToMetadataLines', () => {
  it('maps only the governing ability to one text line', () => {
    expect(
      mapSkillProficiencyCompactSummaryToMetadataLines({
        abilityLabel: 'Dexterity',
        exampleUses: ['Escape notice by moving quietly and hiding behind things'],
      }),
    ).toEqual([
      {
        segments: [{ type: 'text', text: 'Dexterity' }],
      },
    ])
  })
})
