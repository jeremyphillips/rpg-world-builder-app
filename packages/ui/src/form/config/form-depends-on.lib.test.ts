import { describe, expect, it } from 'vitest'

import { resolveDependsOnWatchName } from './form-depends-on.lib'

describe('resolveDependsOnWatchName', () => {
  it('prefixes relative names with the item namePrefix', () => {
    expect(resolveDependsOnWatchName('grantType', 'features.0.grants.0')).toBe(
      'features.0.grants.0.grantType',
    )
  })

  it('returns absolute names when namePrefix is omitted', () => {
    expect(resolveDependsOnWatchName('maxCharacterLevel')).toBe('maxCharacterLevel')
  })

  it('resolves one parent hop to a sibling field on the parent path segment', () => {
    expect(resolveDependsOnWatchName('../level', 'features.0.grants.0')).toBe(
      'features.0.grants.level',
    )
  })

  it('resolves two parent hops to a feature-row sibling from a nested grant item', () => {
    expect(resolveDependsOnWatchName('../../level', 'features.0.grants.0')).toBe('features.0.level')
  })

  it('resolves multiple parent hops', () => {
    expect(resolveDependsOnWatchName('../../../name', 'features.0.grants.0')).toBe('features.name')
  })

  it('returns the field path when parent hops exceed namePrefix depth', () => {
    expect(resolveDependsOnWatchName('../../../../level', 'features.0.grants.0')).toBe('level')
  })
})
