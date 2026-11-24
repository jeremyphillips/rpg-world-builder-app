import { describe, expect, it } from 'vitest'

import { isSpellcastingClassFeature, type ClassBodyFeature } from '@rpg/contracts'

type SpellcastingClassFeature = Extract<ClassBodyFeature, { kind: 'spellcasting' }>

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

function spellcastingFeature(slug: (typeof CASTERS)[number]): SpellcastingClassFeature {
  const cls = getClassBySlug(RULESET, slug)
  const feature = cls.features.find((f) => f.id === 'spellcasting' || f.id === 'pact-magic')
  expect(feature).toBeDefined()
  expect(isSpellcastingClassFeature(feature!)).toBe(true)
  expect(feature!.kind).toBe('spellcasting')
  return feature as SpellcastingClassFeature
}

describe('spellcasting feature residuals', () => {
  it.each(CASTERS)('%s carries intro only (no description)', (slug) => {
    const feature = spellcastingFeature(slug)
    expect(feature.kind).toBe('spellcasting')
    expect(feature.intro?.length).toBeGreaterThan(0)
    expect('description' in feature).toBe(false)
  })
})
