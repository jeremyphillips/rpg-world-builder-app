import { describe, expect, it } from 'vitest'

import type { ChoiceSet } from '../../choice-set'
import {
  formatProficiencyCategorySubhead,
  formatProficiencyChoiceBlockCompactAddLabel,
  formatProficiencyPoolDescription,
  formatProficiencySectionEmptyMessage,
  formatProficiencySingleSetSupportingCopy,
  resolveProficiencyAggregateCount,
} from './format-proficiency-step-copy'

const skillChoiceSet = {
  id: 'class:srd-cc-5.2.1:rogue:class-skills',
  sourceType: 'class',
  sourceId: 'srd-cc-5.2.1:rogue',
  choiceType: 'skillProficiency',
  label: 'Rogue Skills',
  min: 2,
  max: 2,
  required: true,
  options: [
    { id: 'srd-cc-5.2.1:acrobatics', label: 'Acrobatics' },
    { id: 'srd-cc-5.2.1:stealth', label: 'Stealth' },
    { id: 'srd-cc-5.2.1:perception', label: 'Perception' },
  ],
} as const satisfies ChoiceSet

const traitSkillChoiceSet = {
  id: 'species:srd-cc-5.2.1:elf:keen-senses',
  sourceType: 'species',
  sourceId: 'srd-cc-5.2.1:elf',
  choiceType: 'skillProficiency',
  label: 'Keen Senses',
  min: 1,
  max: 1,
  required: true,
  options: [
    { id: 'srd-cc-5.2.1:perception', label: 'Perception' },
    { id: 'srd-cc-5.2.1:investigation', label: 'Investigation' },
  ],
} as const satisfies ChoiceSet

const skillfulChoiceSet = {
  id: 'species:srd-cc-5.2.1:human:trait:skillful',
  sourceType: 'species',
  sourceId: 'srd-cc-5.2.1:human',
  choiceType: 'skillProficiency',
  label: 'Skillful',
  min: 1,
  max: 1,
  required: true,
  poolSource: 'any',
  options: [],
} as const satisfies ChoiceSet

describe('formatProficiencySingleSetSupportingCopy', () => {
  it('absorbs owner headings into from-copy for class skill packages', () => {
    expect(
      formatProficiencySingleSetSupportingCopy({
        choiceSet: skillChoiceSet,
        heading: 'Rogue Skills',
        headingSourceCoverage: 'owner',
        hasFixedGrantsInCategory: false,
      }),
    ).toEqual({
      instruction: 'Choose 2 skills from Rogue Skills.',
    })
  })

  it('uses additional owner copy when fixed grants exist in the category', () => {
    expect(
      formatProficiencySingleSetSupportingCopy({
        choiceSet: skillChoiceSet,
        heading: 'Rogue Skills',
        headingSourceCoverage: 'owner',
        hasFixedGrantsInCategory: true,
      }),
    ).toEqual({
      instruction: 'Choose 2 additional skills from Rogue Skills.',
    })
  })

  it('absorbs any-pool feature headings into for-copy', () => {
    expect(
      formatProficiencySingleSetSupportingCopy({
        choiceSet: skillfulChoiceSet,
        heading: 'Skillful',
        headingSourceCoverage: 'feature',
        hasFixedGrantsInCategory: false,
      }),
    ).toEqual({
      instruction: 'Choose any 1 skill for Skillful.',
    })
  })

  it('keeps constrained feature headings separate from enumerated pool copy', () => {
    expect(
      formatProficiencySingleSetSupportingCopy({
        choiceSet: traitSkillChoiceSet,
        heading: 'Keen Senses',
        headingSourceCoverage: 'feature',
        hasFixedGrantsInCategory: false,
      }),
    ).toEqual({
      identityLine: 'Keen Senses',
      instruction: 'Choose 1 skill from Perception and Investigation.',
    })
  })
})

describe('formatProficiencyCategorySubhead', () => {
  it('uses generic copy for multiple choice sets without fixed grants', () => {
    expect(
      formatProficiencyCategorySubhead('skills', [skillChoiceSet, traitSkillChoiceSet], false),
    ).toBe('Choose skills from the options below.')
  })

  it('uses additional generic copy for multiple choice sets with fixed grants', () => {
    expect(
      formatProficiencyCategorySubhead('skills', [skillChoiceSet, traitSkillChoiceSet], true),
    ).toBe('Choose additional skills from the options below.')
  })
})

describe('formatProficiencyPoolDescription', () => {
  it('enumerates small pools with natural-list grammar', () => {
    expect(formatProficiencyPoolDescription(skillChoiceSet)).toBe(
      'Choose from Acrobatics, Stealth, and Perception.',
    )
  })

  it('summarizes large pools with plural nouns from option count', () => {
    const largePool: ChoiceSet = {
      ...skillChoiceSet,
      options: Array.from({ length: 12 }, (_, index) => ({
        id: `skill-${index}`,
        label: `Skill ${index}`,
      })),
    }

    expect(formatProficiencyPoolDescription(largePool)).toBe('Choose from 12 available skills.')
  })

  it('uses any-pool copy for unconstrained grants', () => {
    const anyPool: ChoiceSet = {
      ...traitSkillChoiceSet,
      poolSource: 'any',
    }

    expect(formatProficiencyPoolDescription(anyPool)).toBe('Choose any 1 skill proficiency.')
  })
})

describe('formatProficiencySectionEmptyMessage', () => {
  it('uses the additional variant when fixed grants exist in the category', () => {
    expect(formatProficiencySectionEmptyMessage('skills', true)).toBe(
      'No additional skills chosen yet.',
    )
  })

  it('uses the base variant when no fixed grants exist', () => {
    expect(formatProficiencySectionEmptyMessage('skills', false)).toBe('No skills chosen yet.')
  })
})

describe('resolveProficiencyAggregateCount', () => {
  it('returns aggregate counts when every choice set is required with fixed min/max', () => {
    expect(
      resolveProficiencyAggregateCount([
        { choiceSet: skillChoiceSet, selectedCount: 1, max: 2 },
        { choiceSet: traitSkillChoiceSet, selectedCount: 0, max: 1 },
      ]),
    ).toEqual({
      selected: 1,
      max: 3,
      label: '1 / 3 chosen',
      verb: 'chosen',
      requiredToComplete: true,
    })
  })

  it('returns null when any choice set is optional or has a range', () => {
    const optionalChoiceSet: ChoiceSet = {
      ...traitSkillChoiceSet,
      min: 0,
      required: false,
    }

    expect(
      resolveProficiencyAggregateCount([
        { choiceSet: skillChoiceSet, selectedCount: 1, max: 2 },
        { choiceSet: optionalChoiceSet, selectedCount: 0, max: 1 },
      ]),
    ).toBeNull()
  })
})

describe('formatProficiencyChoiceBlockCompactAddLabel', () => {
  it('returns compact add copy when the block is not full', () => {
    expect(formatProficiencyChoiceBlockCompactAddLabel(skillChoiceSet, 0)).toBe('Add skill')
  })

  it('returns compact manage copy when the block is full', () => {
    expect(formatProficiencyChoiceBlockCompactAddLabel(skillChoiceSet, 2)).toBe('Edit')
  })
})
