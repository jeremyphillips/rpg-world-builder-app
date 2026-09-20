import { describe, expect, it } from 'vitest'

import type { ChoiceSet } from '../../choice-set'
import {
  resolveProficiencyChoicePresentation,
  sortProficiencyChoiceSets,
} from './resolve-proficiency-choice-presentation'

describe('resolveProficiencyChoicePresentation', () => {
  it('prefers choiceLabel for class skill packages', () => {
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
      sourceLine: 'Rogue class',
    })
  })

  it('uses featureLabel for species trait grants', () => {
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
      sourceLine: 'Human species trait',
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
      sourceLine: 'High Elf heritage',
    })
  })

  it('falls back to owner plus domain when no authored labels exist', () => {
    const choiceSet = {
      choiceType: 'skillProficiency',
      provenance: {
        ownerKind: 'class',
        ownerLabel: 'Druid',
      },
    } as const satisfies Pick<ChoiceSet, 'choiceType' | 'provenance'>

    expect(resolveProficiencyChoicePresentation(choiceSet)).toEqual({
      heading: 'Druid Skills',
      sourceLine: 'Druid class',
    })
  })

  it('omits source line when owner metadata is missing', () => {
    const choiceSet = {
      choiceType: 'skillProficiency',
      provenance: undefined,
    } as const satisfies Pick<ChoiceSet, 'choiceType' | 'provenance'>

    expect(resolveProficiencyChoicePresentation(choiceSet)).toEqual({
      heading: 'Skill Proficiency',
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
