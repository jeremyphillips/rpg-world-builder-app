import { describe, expect, it } from 'vitest'

import {
  formatSkillProficiencySummarySentence,
  SKILL_PROFICIENCY_SECTION_LABELS,
  splitLegacySkillDescriptionIntoExamples,
} from './skill-proficiency-display'

const SRD_LEGACY_DESCRIPTIONS = {
  athletics: 'Jump farther than normal, stay afloat in rough water, or break something.',
  acrobatics: 'Stay on your feet in a tricky situation, or perform an acrobatic stunt.',
  sleightOfHand: 'Pick a pocket, conceal a handheld object, or perform legerdemain.',
  stealth: 'Escape notice by moving quietly and hiding behind things.',
  arcana: 'Recall lore about spells, magic items, and the planes of existence.',
  history: 'Recall lore about historical events, people, nations, and cultures.',
  investigation: 'Find obscure information in books, or deduce how something works.',
  nature: 'Recall lore about terrain, plants, animals, and weather.',
  religion: 'Recall lore about gods, religious rituals, and holy symbols.',
  animalHandling: 'Calm or train an animal, or get an animal to behave in a certain way.',
  insight: "Discern a person's mood and intentions.",
  medicine: 'Diagnose an illness, or determine what killed the recently slain.',
  perception: "Using a combination of senses, notice something that's easy to miss.",
  survival: 'Follow tracks, forage, find a trail, or avoid natural hazards.',
  deception: 'Tell a convincing lie, or wear a disguise convincingly.',
  intimidation: 'Awe or threaten someone into doing what you want.',
  performance: 'Act, tell a story, perform music, or dance.',
  persuasion: 'Honestly and graciously convince someone of something.',
} as const

describe('SKILL_PROFICIENCY_SECTION_LABELS', () => {
  it('exports the examples section label', () => {
    expect(SKILL_PROFICIENCY_SECTION_LABELS.examples).toBe('Examples')
  })
})

describe('splitLegacySkillDescriptionIntoExamples', () => {
  it('splits comma/or-separated athletics use cases', () => {
    expect(splitLegacySkillDescriptionIntoExamples(SRD_LEGACY_DESCRIPTIONS.athletics)).toEqual([
      'Jump farther than normal',
      'Stay afloat in rough water',
      'Break something',
    ])
  })

  it('splits acrobatics on ", or "', () => {
    expect(splitLegacySkillDescriptionIntoExamples(SRD_LEGACY_DESCRIPTIONS.acrobatics)).toEqual([
      'Stay on your feet in a tricky situation',
      'Perform an acrobatic stunt',
    ])
  })

  it('splits survival into four examples', () => {
    expect(splitLegacySkillDescriptionIntoExamples(SRD_LEGACY_DESCRIPTIONS.survival)).toEqual([
      'Follow tracks',
      'Forage',
      'Find a trail',
      'Avoid natural hazards',
    ])
  })

  it('returns a single example for one-clause descriptions', () => {
    expect(splitLegacySkillDescriptionIntoExamples(SRD_LEGACY_DESCRIPTIONS.insight)).toEqual([
      "Discern a person's mood and intentions",
    ])
  })

  it('returns an empty array for blank input', () => {
    expect(splitLegacySkillDescriptionIntoExamples('   ')).toEqual([])
  })
})

describe('formatSkillProficiencySummarySentence', () => {
  it('builds the athletics lead sentence', () => {
    expect(
      formatSkillProficiencySummarySentence({
        name: 'Athletics',
        description: 'Physical challenges involving strength, movement, and force.',
      }),
    ).toBe('Athletics covers physical challenges involving strength, movement, and force.')
  })

  it('lowercases the predicate and normalizes trailing periods', () => {
    expect(
      formatSkillProficiencySummarySentence({
        name: 'Stealth',
        description: 'Moving unseen and unheard...',
      }),
    ).toBe('Stealth covers moving unseen and unheard.')
  })

  it('returns undefined when description is missing or blank', () => {
    expect(formatSkillProficiencySummarySentence({ name: 'Athletics' })).toBeUndefined()
    expect(
      formatSkillProficiencySummarySentence({ name: 'Athletics', description: '   ' }),
    ).toBeUndefined()
  })
})
