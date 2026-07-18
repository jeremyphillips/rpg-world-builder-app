import { describe, expect, it } from 'vitest'

import { CONVENTIONS } from '@rpg/name-generator-data'
import { NAME_SUBJECT_KIND_ENTRIES } from '@rpg/contracts/name-generator'

describe('shipped convention subject kind labels', () => {
  it('includes a UI label for every subject kind used by shipped conventions', () => {
    const labeledKinds = new Set(Object.keys(NAME_SUBJECT_KIND_ENTRIES))
    const conventionSubjectKinds = new Set(
      CONVENTIONS.flatMap((convention) => convention.subjectKinds),
    )

    for (const subjectKind of conventionSubjectKinds) {
      expect(labeledKinds.has(subjectKind)).toBe(true)
    }
  })
})
