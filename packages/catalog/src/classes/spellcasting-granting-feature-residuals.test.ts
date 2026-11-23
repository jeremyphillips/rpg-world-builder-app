import { describe, expect, it } from 'vitest'

import { isClassSpellcastingGrantingFeature } from '@rpg/contracts'

import { getClassBySlug } from './index'

const RULESET = 'srd-cc-5.2.1' as const

const CASTERS = [
  'bard',
  'cleric',
  'druid',
  'paladin',
  'ranger',
  'sorcerer',
  'warlock',
  'wizard',
] as const

function grantingSpellcastingFeature(slug: (typeof CASTERS)[number]) {
  const cls = getClassBySlug(RULESET, slug)
  const feature = cls.features.find((f) => f.id === 'spellcasting' || f.id === 'pact-magic')
  expect(feature).toBeDefined()
  expect(isClassSpellcastingGrantingFeature(feature!)).toBe(true)
  return feature!
}

describe('spellcasting granting feature residuals', () => {
  it.each(CASTERS)('%s carries intro only (no description)', (slug) => {
    const feature = grantingSpellcastingFeature(slug)
    expect(feature.intro?.length).toBeGreaterThan(0)
    expect(feature.description).toBeUndefined()
  })
})
