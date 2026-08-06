import { describe, expect, it } from 'vitest'

import {
  isRelationshipKindMutationMode,
  isRelationshipSubjectMutationMode,
} from './relationship-mutation-mode'

describe('relationship-mutation-mode', () => {
  it('identifies change-kind mutation modes', () => {
    expect(isRelationshipKindMutationMode('changeKind')).toBe(true)
    expect(isRelationshipKindMutationMode('add')).toBe(false)
    expect(isRelationshipKindMutationMode('replaceOrganization')).toBe(false)
  })

  it('identifies replace-subject mutation modes', () => {
    expect(isRelationshipSubjectMutationMode('replaceSubject')).toBe(true)
    expect(isRelationshipSubjectMutationMode('replaceOrganization')).toBe(true)
    expect(isRelationshipSubjectMutationMode('changeKind')).toBe(false)
  })
})
