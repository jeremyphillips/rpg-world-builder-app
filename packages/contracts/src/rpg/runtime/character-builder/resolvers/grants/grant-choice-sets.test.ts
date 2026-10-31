import { describe, expect, it } from 'vitest'

import type { Feat } from '../../../../content/feat'
import { indexCharacterBuildCatalog } from '../../context'
import { contentGrantToChoiceSets } from './grant-choice-sets'
import { athleticsSkill, builderTestCatalog } from '../../test-fixtures'
import { acrobaticsSkill, luteTool, stealthSkill } from '../../proficiency-test-fixtures'

const catalogWithSkillsAndEquipment = {
  ...builderTestCatalog,
  skillProficiencies: [athleticsSkill, stealthSkill, acrobaticsSkill],
  organizations: [],
  equipment: [luteTool],
}

describe('contentGrantToChoiceSets — languageChoice', () => {
  const catalogIndex = indexCharacterBuildCatalog(builderTestCatalog)

  it('expands category pools against the catalog vocabulary', () => {
    const [choiceSet] = contentGrantToChoiceSets(
      { id: 'language-choice-1', kind: 'languageChoice', choose: 1, categories: ['standard'] },
      {
        sourceType: 'species',
        sourceId: 'srd-cc-5.2.1:elf',
        slot: 'trait:lineage:languageChoice:0',
      },
      catalogIndex,
    )

    expect(choiceSet?.options).toEqual([
      { id: 'common', label: 'Common' },
      { id: 'elvish', label: 'Elvish' },
      { id: 'dwarvish', label: 'Dwarvish' },
      { id: 'draconic', label: 'Draconic' },
    ])
  })

  it('resolves explicit language ids from the catalog with vocab fallback', () => {
    const [choiceSet] = contentGrantToChoiceSets(
      {
        id: 'language-choice-2',
        kind: 'languageChoice',
        choose: 1,
        from: ['elvish', 'unknown-language'],
      },
      {
        sourceType: 'species',
        sourceId: 'srd-cc-5.2.1:elf',
        slot: 'trait:lineage:languageChoice:0',
      },
      catalogIndex,
    )

    expect(choiceSet?.options).toEqual([
      { id: 'elvish', label: 'Elvish' },
      { id: 'unknown-language', label: 'Unknown Language' },
    ])
  })
})

describe('contentGrantToChoiceSets — proficiency pools', () => {
  const catalogIndex = indexCharacterBuildCatalog(catalogWithSkillsAndEquipment)

  it('expands any skill pools against the catalog vocabulary', () => {
    const [choiceSet] = contentGrantToChoiceSets(
      {
        id: 'skill-proficiency-3',
        kind: 'skillProficiency',
        grant: { kind: 'choice', choose: 1, pool: { source: 'any' } },
      },
      {
        sourceType: 'species',
        sourceId: 'srd-cc-5.2.1:elf',
        slot: 'trait:training:skillProficiency',
      },
      catalogIndex,
    )

    expect(choiceSet?.options).toEqual([
      { id: acrobaticsSkill.id, label: 'Acrobatics' },
      { id: athleticsSkill.id, label: 'Athletics' },
      { id: stealthSkill.id, label: 'Stealth' },
    ])
  })

  it('expands any tool pools against catalog equipment', () => {
    const [choiceSet] = contentGrantToChoiceSets(
      {
        id: 'tool-proficiency-4',
        kind: 'toolProficiency',
        grant: { kind: 'choice', choose: 1, pool: { source: 'any' } },
      },
      {
        sourceType: 'species',
        sourceId: 'srd-cc-5.2.1:elf',
        slot: 'trait:training:toolProficiency',
      },
      catalogIndex,
    )

    expect(choiceSet?.options).toEqual([{ id: luteTool.id, label: 'Lute' }])
  })
})

describe('contentGrantToChoiceSets — featChoice', () => {
  const alert = { slug: 'alert', name: 'Alert' } as Feat
  const catalogIndex = indexCharacterBuildCatalog({
    ...builderTestCatalog,
    feats: [alert],
  })

  it('labels a recommended feat by catalog name and omits an unknown slug', () => {
    const [choiceSet] = contentGrantToChoiceSets(
      {
        id: 'feat-choice-1',
        kind: 'featChoice',
        category: 'origin',
        choose: 1,
        recommendedFeatIds: ['alert', 'missing-feat'],
      },
      {
        sourceType: 'species',
        sourceId: 'srd-cc-5.2.1:human',
        slot: 'trait:versatile:grant:feat-choice-1',
      },
      catalogIndex,
    )

    expect(choiceSet).toMatchObject({
      choiceType: 'feat',
      min: 1,
      max: 1,
      options: [{ id: 'alert', label: 'Alert' }],
    })
  })
})
