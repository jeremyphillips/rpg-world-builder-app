import { describe, expect, it } from 'vitest'

import { collectLanguageIdsFromBody } from './collect-content-vocabulary-ids'

describe('collectLanguageIdsFromBody', () => {
  it('collects language ids from trait grants, heritage options, and languageAffinities', () => {
    const ids = collectLanguageIdsFromBody({
      languageAffinities: ['elvish', 'dwarvish'],
      traits: [
        {
          kind: 'grant',
          id: 'tongues',
          grantGroups: [{ grants: [{ kind: 'languages', languageIds: ['draconic'] }] }],
        },
      ],
      heritage: {
        id: 'lineage',
        name: 'Lineage',
        options: [
          {
            kind: 'grant',
            id: 'option',
            grantGroups: [
              {
                grants: [{ kind: 'languageChoice', choose: 1, from: ['gnomish'] }],
              },
            ],
          },
        ],
      },
    })

    expect(ids.sort()).toEqual(['draconic', 'dwarvish', 'elvish', 'gnomish'])
  })

  it('ignores non-string languageAffinities entries', () => {
    expect(
      collectLanguageIdsFromBody({
        languageAffinities: ['halfling', 42, null],
      }),
    ).toEqual(['halfling'])
  })
})
