import { describe, expect, it } from 'vitest'

import { indexCharacterBuildCatalog } from '../context'
import { contentGrantToChoiceSets } from './grant-choice-sets'
import { builderTestCatalog } from '../test-fixtures'

describe('contentGrantToChoiceSets — languageChoice', () => {
  const catalogIndex = indexCharacterBuildCatalog(builderTestCatalog)

  it('expands category pools against the catalog vocabulary', () => {
    const [choiceSet] = contentGrantToChoiceSets(
      { kind: 'languageChoice', choose: 1, categories: ['standard'] },
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
      { kind: 'languageChoice', choose: 1, from: ['elvish', 'unknown-language'] },
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
