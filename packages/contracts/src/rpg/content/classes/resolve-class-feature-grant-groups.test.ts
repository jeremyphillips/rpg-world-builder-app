import { describe, expect, it } from 'vitest'

import {
  CLASS_ASI_FEAT_CHOICE_GRANT_ID,
  resolveClassFeatureGrantGroups,
} from './resolve-class-feature-grant-groups'

describe('resolveClassFeatureGrantGroups', () => {
  it('projects the canonical ASI feat choice', () => {
    const groups = resolveClassFeatureGrantGroups({
      kind: 'asi',
      id: 'asi-4',
      name: 'Ability Score Improvement',
      level: 4,
    })
    expect(groups).toHaveLength(1)
    expect(groups[0]!.grants[0]!.id).toBe(CLASS_ASI_FEAT_CHOICE_GRANT_ID)
  })

  it('returns no groups for spellcasting rows', () => {
    expect(
      resolveClassFeatureGrantGroups({
        kind: 'spellcasting',
        id: 'spellcasting',
        name: 'Spellcasting',
        level: 1,
      }),
    ).toEqual([])
  })
})
