import { describe, expect, it } from 'vitest'

import {
  createCampaignContentEligibilityIndex,
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  formatCharacterSummary,
  resolveCharacterSummaryParts,
  type CampaignContentEligibilityEntry,
} from '@rpg/contracts'

import {
  buildCharacterCardSummaryDto,
  createCharacterSummaryLabelLookup,
} from './build-character-card-summary-dto.lib'

const contentById = new Map<string, CampaignContentEligibilityEntry>([
  ['srd-cc-5.2.1:dwarf', { access: DEFAULT_CONTENT_CAMPAIGN_ACCESS, label: 'Dwarf' }],
  ['srd-cc-5.2.1:elf', { access: DEFAULT_CONTENT_CAMPAIGN_ACCESS, label: 'Elf' }],
  ['srd-cc-5.2.1:fighter', { access: DEFAULT_CONTENT_CAMPAIGN_ACCESS, label: 'Fighter' }],
  ['srd-cc-5.2.1:rogue', { access: DEFAULT_CONTENT_CAMPAIGN_ACCESS, label: 'Rogue' }],
  ['srd-cc-5.2.1:champion', { access: DEFAULT_CONTENT_CAMPAIGN_ACCESS, label: 'Champion' }],
])

const contentIndex = createCampaignContentEligibilityIndex(contentById, {
  heritageBySpeciesId: new Map([
    ['srd-cc-5.2.1:elf', new Map([['drow', { speciesId: 'srd-cc-5.2.1:elf', label: 'Drow' }]])],
  ]),
})

describe('buildCharacterCardSummaryDto', () => {
  it('formats single-class summaries without per-class level suffix', () => {
    expect(
      buildCharacterCardSummaryDto({
        character: {
          id: 'char_1',
          name: 'Verna',
          species: { id: 'srd-cc-5.2.1:dwarf' },
          classes: [{ classId: 'srd-cc-5.2.1:fighter', level: 4 }],
        },
        contentIndex,
      }),
    ).toEqual({
      id: 'char_1',
      name: 'Verna',
      summary: 'Dwarf · Level 4 Fighter',
    })
  })

  it('formats multiclass summaries with class allocation', () => {
    expect(
      buildCharacterCardSummaryDto({
        character: {
          id: 'char_2',
          name: 'Split',
          species: { id: 'srd-cc-5.2.1:dwarf' },
          classes: [
            { classId: 'srd-cc-5.2.1:fighter', level: 3 },
            { classId: 'srd-cc-5.2.1:rogue', level: 1 },
          ],
        },
        contentIndex,
      }).summary,
    ).toBe('Dwarf · Level 4 · Fighter 3 / Rogue 1')
  })

  it('matches dashboard-resolved parts for the same character fixture', () => {
    const character = {
      species: { id: 'srd-cc-5.2.1:elf', heritageId: 'drow' },
      classes: [
        {
          classId: 'srd-cc-5.2.1:fighter',
          subclassId: 'srd-cc-5.2.1:champion',
          level: 3,
        },
      ],
    }

    const lookup = createCharacterSummaryLabelLookup(contentIndex)
    const parts = resolveCharacterSummaryParts(character, lookup)

    expect(formatCharacterSummary(parts)).toBe('Elf (Drow) · Level 3 Fighter (Champion)')
  })
})
