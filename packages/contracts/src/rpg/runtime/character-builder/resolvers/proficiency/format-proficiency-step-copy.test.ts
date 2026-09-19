import { describe, expect, it } from 'vitest'

import type { ChoiceSet } from '../../choice-set'
import {
  formatProficiencyCategorySubhead,
  formatProficiencyChoiceBlockAddLabel,
  formatProficiencyPoolDescription,
  formatProficiencySectionEmptyMessage,
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

describe('formatProficiencyCategorySubhead', () => {
  it('uses source-specific copy for a single choice set', () => {
    expect(formatProficiencyCategorySubhead('skills', [skillChoiceSet])).toBe(
      'Choose 2 skills from Rogue Skills.',
    )
  })

  it('uses generic copy for multiple choice sets', () => {
    expect(formatProficiencyCategorySubhead('skills', [skillChoiceSet, traitSkillChoiceSet])).toBe(
      'Choose additional skills from the options below.',
    )
  })
})

describe('formatProficiencyPoolDescription', () => {
  it('enumerates small pools', () => {
    expect(formatProficiencyPoolDescription(skillChoiceSet)).toBe(
      'Choose from Acrobatics, Stealth, Perception.',
    )
  })

  it('summarizes large pools', () => {
    const largePool: ChoiceSet = {
      ...skillChoiceSet,
      options: Array.from({ length: 12 }, (_, index) => ({
        id: `skill-${index}`,
        label: `Skill ${index}`,
      })),
    }

    expect(formatProficiencyPoolDescription(largePool)).toBe('Choose from 12 available skills.')
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

describe('formatProficiencyChoiceBlockAddLabel', () => {
  it('returns add copy when the block is not full', () => {
    expect(formatProficiencyChoiceBlockAddLabel(skillChoiceSet, 0)).toBe('Add skill proficiency')
  })

  it('returns manage copy when the block is full', () => {
    expect(formatProficiencyChoiceBlockAddLabel(skillChoiceSet, 2)).toBe('Manage skill choices')
  })
})
