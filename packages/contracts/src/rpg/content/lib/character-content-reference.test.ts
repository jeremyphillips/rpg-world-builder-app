import { describe, expect, it } from 'vitest'

import {
  characterContentReferenceMatch,
  CLASS_CHARACTER_REFERENCE,
  createCharacterContentReferenceDescriptor,
  ORGANIZATION_CHARACTER_REFERENCE,
  SKILL_PROFICIENCY_CHARACTER_REFERENCE,
  SUBCLASS_CHARACTER_REFERENCE,
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

  it('exposes class, subclass, and skill-proficiency descriptors', () => {
    expect(characterContentReferenceMatch(CLASS_CHARACTER_REFERENCE, 'class-1')).toEqual({
      'classes.classId': 'class-1',
    })
    expect(characterContentReferenceMatch(SUBCLASS_CHARACTER_REFERENCE, 'sc-1')).toEqual({
      'classes.subclassId': 'sc-1',
    })
    expect(SKILL_PROFICIENCY_CHARACTER_REFERENCE.matchKey).toBe('slug')
  })
})
