import { describe, expect, it } from 'vitest'

import { resolveCharacterBuildStepForIssuePath } from './resolve-character-build-step-for-issue-path'

describe('resolveCharacterBuildStepForIssuePath', () => {
  it('maps known API paths to builder steps', () => {
    expect(resolveCharacterBuildStepForIssuePath('spells.0.access')).toBe('spells')
    expect(resolveCharacterBuildStepForIssuePath('media.roles')).toBe('identity')
    expect(resolveCharacterBuildStepForIssuePath('name')).toBe('identity')
    expect(resolveCharacterBuildStepForIssuePath('abilityScores.str')).toBe('abilities')
    expect(resolveCharacterBuildStepForIssuePath('classes.0.level')).toBe('class')
    expect(resolveCharacterBuildStepForIssuePath('relationshipEdges.0')).toBe('connections')
  })

  it('returns undefined for unknown paths', () => {
    expect(resolveCharacterBuildStepForIssuePath('vital.status')).toBeUndefined()
    expect(resolveCharacterBuildStepForIssuePath('')).toBeUndefined()
  })
})
