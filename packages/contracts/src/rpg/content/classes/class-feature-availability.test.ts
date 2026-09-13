import { describe, expect, it } from 'vitest'

import {
  availableClassFeatures,
  classFeaturesUnlockedAtLevel,
  isClassFeatureAvailable,
} from './class-feature-availability'

describe('isClassFeatureAvailable', () => {
  it('treats omitted and true as available', () => {
    expect(isClassFeatureAvailable({})).toBe(true)
    expect(isClassFeatureAvailable({ available: true })).toBe(true)
  })

  it('treats false as unavailable', () => {
    expect(isClassFeatureAvailable({ available: false })).toBe(false)
  })
})

describe('availableClassFeatures', () => {
  it('filters unavailable rows', () => {
    const features = [{ id: 'a', available: true }, { id: 'b', available: false }, { id: 'c' }]
    expect(availableClassFeatures(features).map((f) => f.id)).toEqual(['a', 'c'])
  })
})

describe('classFeaturesUnlockedAtLevel', () => {
  it('returns available features at or below the character level', () => {
    const features = [
      { id: 'a', level: 1 },
      { id: 'b', level: 3, available: false },
      { id: 'c', level: 5 },
    ]
    expect(classFeaturesUnlockedAtLevel(features, 3).map((f) => f.id)).toEqual(['a'])
  })
})
