import { describe, expect, it } from 'vitest'

import {
  grantSetModeFromBuckets,
  isMixedGrantSet,
  projectGrantSetFromMode,
} from './proficiency-grant-set-mode.lib'

describe('projectGrantSetFromMode', () => {
  const buckets = { categories: ['light'], items: ['chain-mail'] }

  it('projects none to empty grant', () => {
    expect(projectGrantSetFromMode('none', buckets)).toEqual({ categories: [], items: [] })
  })

  it('projects categories and drops items', () => {
    expect(projectGrantSetFromMode('categories', buckets)).toEqual({
      categories: ['light'],
      items: [],
    })
  })

  it('projects specific and drops categories', () => {
    expect(projectGrantSetFromMode('specific', buckets)).toEqual({
      categories: [],
      items: ['chain-mail'],
    })
  })
})

describe('grantSetModeFromBuckets', () => {
  it('returns mixed for dual-branch persisted grants', () => {
    expect(grantSetModeFromBuckets({ categories: ['light'], items: ['chain-mail'] })).toEqual({
      kind: 'mixed',
    })
  })
})

describe('isMixedGrantSet', () => {
  it('is false for single-branch and empty grants', () => {
    expect(isMixedGrantSet({ categories: ['light'], items: [] })).toBe(false)
    expect(isMixedGrantSet({ categories: [], items: ['chain-mail'] })).toBe(false)
    expect(isMixedGrantSet({ categories: [], items: [] })).toBe(false)
  })
})
