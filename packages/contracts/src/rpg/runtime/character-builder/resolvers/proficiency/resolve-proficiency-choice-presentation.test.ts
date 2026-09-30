import { describe, expect, it } from 'vitest'

import type { ChoiceSet } from '../../choice-set'
import {
  resolveProficiencyChoicePresentation,
  resolveProficiencyChoiceSetPresentation,
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
      sourceLabel: 'Rogue class',
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
      sourceLabel: 'Human species trait',
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
      sourceLabel: 'Circle of the Moon subclass',
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
      sourceLabel: 'High Elf heritage',
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
      sourceLabel: 'Druid class',
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
      sourceLabel: 'Origin',
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
      sourceLabel: 'Origin',
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

describe('resolveProficiencyChoiceSetPresentation', () => {
  it('composes heading, ungated source, gated source line, and pool copy for Keen Senses', () => {
    const choiceSet: ChoiceSet = {
      id: 'species:srd-cc-5.2.1:elf:trait:keen-senses:skillProficiency',
      sourceType: 'species',
      sourceId: 'srd-cc-5.2.1:elf',
      choiceType: 'skillProficiency',
      label: 'Keen Senses',
      min: 1,
      max: 1,
      required: true,
      options: [
        { id: 'insight', label: 'Insight' },
        { id: 'perception', label: 'Perception' },
        { id: 'survival', label: 'Survival' },
      ],
      provenance: {
        ownerKind: 'species',
        ownerLabel: 'Elf',
        featureLabel: 'Keen Senses',
      },
    }

    expect(resolveProficiencyChoiceSetPresentation(choiceSet)).toEqual({
      heading: 'Keen Senses',
      headingSourceCoverage: 'feature',
      sourceLabel: 'Elf species trait',
      sourceLine: 'Elf species trait',
      poolDescription: 'Choose from Insight, Perception, and Survival.',
    })
  })

  it('keeps Fighter Skills source ungated but omits Builder source line', () => {
    const choiceSet: ChoiceSet = {
      id: 'class:srd-cc-5.2.1:fighter:class-skills',
      sourceType: 'class',
      sourceId: 'srd-cc-5.2.1:fighter',
      choiceType: 'skillProficiency',
      label: 'Fighter Skills',
      min: 2,
      max: 2,
      required: true,
      options: [
        { id: 'acrobatics', label: 'Acrobatics' },
        { id: 'athletics', label: 'Athletics' },
        { id: 'history', label: 'History' },
        { id: 'intimidation', label: 'Intimidation' },
        { id: 'perception', label: 'Perception' },
      ],
      provenance: {
        ownerKind: 'class',
        ownerLabel: 'Fighter',
        choiceLabel: 'Fighter Skills',
      },
    }

    expect(resolveProficiencyChoiceSetPresentation(choiceSet)).toEqual({
      heading: 'Fighter Skills',
      headingSourceCoverage: 'owner',
      sourceLabel: 'Fighter class',
      poolDescription: 'Choose from Acrobatics, Athletics, History, Intimidation, and Perception.',
    })
  })

  it('names Origin Languages with Origin as the semantic source', () => {
    const choiceSet: ChoiceSet = {
      id: 'ruleset:srd-cc-5.2.1:origin-languages',
      sourceType: 'ruleset',
      sourceId: 'srd-cc-5.2.1',
      choiceType: 'language',
      label: 'Origin Languages',
      min: 2,
      max: 2,
      required: true,
      options: [
        { id: 'dwarvish', label: 'Dwarvish' },
        { id: 'elvish', label: 'Elvish' },
        { id: 'giant', label: 'Giant' },
      ],
      provenance: {
        ownerKind: 'origin',
        choiceLabel: 'Origin Languages',
      },
    }

    expect(resolveProficiencyChoiceSetPresentation(choiceSet)).toEqual({
      heading: 'Origin Languages',
      headingSourceCoverage: 'owner',
      sourceLabel: 'Origin',
      poolDescription: 'Choose from Dwarvish, Elvish, and Giant.',
    })
  })

  it('uses Guard role as the semantic source for a role skill allowance', () => {
    const choiceSet: ChoiceSet = {
      id: 'npcTemplate:guard:skills',
      sourceType: 'npcTemplate',
      sourceId: 'guard',
      choiceType: 'skillProficiency',
      label: 'Choose 1 role skill',
      min: 1,
      max: 1,
      required: true,
      poolSource: 'any',
      options: [{ id: 'athletics', label: 'Athletics' }],
      provenance: {
        ownerKind: 'npcTemplate',
        ownerLabel: 'Guard',
        choiceLabel: 'Choose 1 role skill',
      },
    }

    expect(resolveProficiencyChoiceSetPresentation(choiceSet)).toEqual({
      heading: 'Choose 1 role skill',
      headingSourceCoverage: 'owner',
      sourceLabel: 'Guard role',
      poolDescription: 'Choose any 1 skill proficiency.',
    })
  })
})
