import { describe, expect, it } from 'vitest'

import {
  characterContentReferenceMatch,
  createCharacterContentReferenceDescriptor,
  ORGANIZATION_CHARACTER_REFERENCE,
} from './character-content-reference'

describe('character content reference descriptors', () => {
  it('creates descriptors with owner character', () => {
    expect(
      createCharacterContentReferenceDescriptor({
        path: 'proficiencies.skills.skill',
        matchKey: 'slug',
      }),
    ).toEqual({
      owner: 'character',
      path: 'proficiencies.skills.skill',
      matchKey: 'slug',
    })
  })

  it('builds organization saved-reference match fragments', () => {
    expect(characterContentReferenceMatch(ORGANIZATION_CHARACTER_REFERENCE, 'org-1')).toEqual({
      'connections.organizations.organizationId': 'org-1',
    })
  })
})
