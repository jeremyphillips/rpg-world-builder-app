import { describe, expect, it } from 'vitest'

import type { VocabularyUsageReference } from '@rpg/contracts'

import { groupUsageReferences } from './group-usage-references'

describe('groupUsageReferences', () => {
  it('preserves API encounter order within and across groups', () => {
    const references: VocabularyUsageReference[] = [
      {
        kind: 'content',
        contentTypeKey: 'species',
        id: 'b',
        label: 'Beta Species',
        slug: 'beta-species',
      },
      {
        kind: 'content',
        contentTypeKey: 'species',
        id: 'a',
        label: 'Alpha Species',
        slug: 'alpha-species',
      },
      {
        kind: 'character',
        id: 'pc-1',
        label: 'Zed',
        characterType: 'pc',
      },
      {
        kind: 'character',
        id: 'pc-2',
        label: 'Amy',
        characterType: 'pc',
      },
    ]

    const groups = groupUsageReferences(references)

    expect(groups.map((group) => group.key)).toEqual(['species', 'character'])
    expect(groups[0]?.references.map((reference) => reference.label)).toEqual([
      'Beta Species',
      'Alpha Species',
    ])
    expect(groups[1]?.references.map((reference) => reference.label)).toEqual(['Zed', 'Amy'])
  })
})
