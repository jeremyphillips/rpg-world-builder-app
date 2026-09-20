import { describe, expect, it } from 'vitest'

import type { ChoiceSet } from '../../choice-set'
import {
  resolveProficiencyChoiceDisambiguationSourceLine,
  resolveProficiencyChoicePresentation,
  sortProficiencyChoiceSets,
} from './resolve-proficiency-choice-presentation'

describe('resolveProficiencyChoicePresentation', () => {
  it('omits source line for class skill packages with authored choice labels', () => {
    const choiceSet = {
      choiceType: 'skillProficiency',
      provenance: {
        ownerKind: 'class',
        ownerLabel: 'Rogue',
        choiceLabel: 'Rogue Skills',
      },
    } as const satisfies Pick<ChoiceSet, 'choiceType' | 'provenance'>

    expect(resolveProficiencyChoicePresentation(choiceSet)).toEqual({
      heading: 'Rogue Skills',
      headingSourceCoverage: 'owner',
    })
  })

  it('shows source line for species trait feature headings', () => {
    const choiceSet = {
      choiceType: 'skillProficiency',
      provenance: {
        ownerKind: 'species',
        ownerLabel: 'Human',
        featureLabel: 'Skillful',
      },
    } as const satisfies Pick<ChoiceSet, 'choiceType' | 'provenance'>

    expect(resolveProficiencyChoicePresentation(choiceSet)).toEqual({
      heading: 'Skillful',
      headingSourceCoverage: 'feature',
      sourceLine: 'Human species trait',
    })
  })

  it('shows subclass source line for subclass feature headings', () => {
    const choiceSet = {
      choiceType: 'skillProficiency',
      provenance: {
        ownerKind: 'subclass',
        ownerLabel: 'Circle of the Moon',
        featureLabel: 'Primal Aptitude',
      },
    } as const satisfies Pick<ChoiceSet, 'choiceType' | 'provenance'>

    expect(resolveProficiencyChoicePresentation(choiceSet)).toEqual({
      heading: 'Primal Aptitude',
      headingSourceCoverage: 'feature',
      sourceLine: 'Circle of the Moon subclass',
    })
  })

  it('uses heritage option name for heritage grants', () => {
    const choiceSet = {
      choiceType: 'skillProficiency',
      provenance: {
        ownerKind: 'heritage',
        ownerLabel: 'High Elf',
        featureLabel: 'High Elf',
      },
    } as const satisfies Pick<ChoiceSet, 'choiceType' | 'provenance'>

    expect(resolveProficiencyChoicePresentation(choiceSet)).toEqual({
      heading: 'High Elf',
      headingSourceCoverage: 'feature',
      sourceLine: 'High Elf heritage',
    })
  })

  it('omits source line for owner-derived headings like Druid Skills', () => {
    const choiceSet = {
      choiceType: 'skillProficiency',
      provenance: {
        ownerKind: 'class',
        ownerLabel: 'Druid',
      },
    } as const satisfies Pick<ChoiceSet, 'choiceType' | 'provenance'>

    expect(resolveProficiencyChoicePresentation(choiceSet)).toEqual({
      heading: 'Druid Skills',
      headingSourceCoverage: 'owner',
    })
  })

  it('omits source line for origin language choice labels', () => {
    const choiceSet = {
      choiceType: 'language',
      provenance: {
        ownerKind: 'origin',
        choiceLabel: 'Origin Languages',
      },
    } as const satisfies Pick<ChoiceSet, 'choiceType' | 'provenance'>

    expect(resolveProficiencyChoicePresentation(choiceSet)).toEqual({
      heading: 'Origin Languages',
      headingSourceCoverage: 'owner',
    })
  })

  it('shows source line for generic headings when provenance is known', () => {
    const choiceSet = {
      choiceType: 'language',
      provenance: {
        ownerKind: 'origin',
      },
    } as const satisfies Pick<ChoiceSet, 'choiceType' | 'provenance'>

    expect(resolveProficiencyChoicePresentation(choiceSet)).toEqual({
      heading: 'Language',
      headingSourceCoverage: 'generic',
      sourceLine: 'Origin',
    })
  })

  it('omits source line when owner metadata is missing', () => {
    const choiceSet = {
      choiceType: 'skillProficiency',
      provenance: undefined,
    } as const satisfies Pick<ChoiceSet, 'choiceType' | 'provenance'>

    expect(resolveProficiencyChoicePresentation(choiceSet)).toEqual({
      heading: 'Skill Proficiency',
      headingSourceCoverage: 'generic',
    })
  })
})

describe('resolveProficiencyChoiceDisambiguationSourceLine', () => {
  it('falls back to provenance source when block source line is omitted', () => {
    const presentation = resolveProficiencyChoicePresentation({
      choiceType: 'skillProficiency',
      provenance: {
        ownerKind: 'class',
        ownerLabel: 'Druid',
      },
    })

    expect(
      resolveProficiencyChoiceDisambiguationSourceLine(presentation, {
        ownerKind: 'class',
        ownerLabel: 'Druid',
      }),
    ).toBe('Druid class')
  })
})

describe('sortProficiencyChoiceSets', () => {
  it('orders class choices before species choices while preserving same-kind order', () => {
    const classSkills: ChoiceSet = {
      id: 'class:srd-cc-5.2.1:rogue:class-skills',
      sourceType: 'class',
      sourceId: 'srd-cc-5.2.1:rogue',
      choiceType: 'skillProficiency',
      label: 'Rogue Skills',
      min: 2,
      max: 2,
      required: true,
      options: [],
      provenance: { ownerKind: 'class', ownerLabel: 'Rogue', choiceLabel: 'Rogue Skills' },
    }
    const classFeature: ChoiceSet = {
      id: 'class:srd-cc-5.2.1:rogue:feature:bonus',
      sourceType: 'class',
      sourceId: 'srd-cc-5.2.1:rogue',
      choiceType: 'skillProficiency',
      label: 'Bonus Proficiencies',
      min: 1,
      max: 1,
      required: true,
      options: [],
      provenance: {
        ownerKind: 'class',
        ownerLabel: 'Rogue',
        featureLabel: 'Bonus Proficiencies',
      },
    }
    const speciesTrait: ChoiceSet = {
      id: 'species:srd-cc-5.2.1:human:trait:skillful',
      sourceType: 'species',
      sourceId: 'srd-cc-5.2.1:human',
      choiceType: 'skillProficiency',
      label: 'Skillful',
      min: 1,
      max: 1,
      required: true,
      options: [],
      provenance: {
        ownerKind: 'species',
        ownerLabel: 'Human',
        featureLabel: 'Skillful',
      },
    }

    expect(
      sortProficiencyChoiceSets([classSkills, classFeature, speciesTrait]).map(
        (choiceSet) => choiceSet.id,
      ),
    ).toEqual([classSkills.id, classFeature.id, speciesTrait.id])
  })
})
