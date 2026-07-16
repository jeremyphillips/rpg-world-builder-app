import { describe, expect, it } from 'vitest'

import { loadSeedSpells } from './index'
import { deriveResolutionFromSpell } from './lib/derive-resolution-from-spell'
import {
  resolveSpellSeedResolution,
  SRD_521_SPELL_SEED_RESOLUTION_SLUGS,
} from './spell-seed-resolution'
import { SRD_521_SPELL_MODELING_MANIFEST } from './spell-modeling-manifest'

const RULESET = 'srd-cc-5.2.1' as const

function spellBySlug(slug: string) {
  const spell = loadSeedSpells(RULESET).find((entry) => entry.slug === slug)
  if (!spell) throw new Error(`Missing seed spell: ${slug}`)
  return spell
}

describe('resolution selection migration audit', () => {
  for (const slug of SRD_521_SPELL_SEED_RESOLUTION_SLUGS) {
    it(`${slug}: has explicit selectionMode without legacy target.self proximity`, () => {
      const resolution = resolveSpellSeedResolution(spellBySlug(slug))
      expect(resolution?.selectionMode, slug).toBeDefined()
      expect(resolution?.target?.proximity.kind, slug).not.toBe('self')
    })
  }

  it('fireball uses point mode with resolution area and origin', () => {
    const resolution = resolveSpellSeedResolution(spellBySlug('fireball'))
    expect(resolution?.selectionMode).toBe('point')
    expect(resolution?.origin?.proximity.distance.value).toBe(150)
    expect(resolution?.areaOfEffect).toEqual({
      shape: 'sphere',
      radius: { value: 20, unit: 'ft' },
    })
    expect(resolution?.target).toBeUndefined()
  })

  it('burning-hands uses self mode with cone area', () => {
    const resolution = resolveSpellSeedResolution(spellBySlug('burning-hands'))
    expect(resolution?.selectionMode).toBe('self')
    expect(resolution?.areaOfEffect).toEqual({
      shape: 'cone',
      length: { value: 15, unit: 'ft' },
    })
    expect(resolution?.target).toBeUndefined()
  })

  it('mass-healing-word uses up-to target count', () => {
    const resolution = resolveSpellSeedResolution(spellBySlug('mass-healing-word'))
    expect(resolution?.selectionMode).toBe('targets')
    expect(resolution?.target).toMatchObject({ count: 6, countKind: 'up-to' })
  })

  it('documents known targeting gaps on hybrid spells via modeling manifest', () => {
    expect(
      SRD_521_SPELL_MODELING_MANIFEST['eldritch-blast']?.gaps?.some(
        (gap) => gap.code === 'dynamic-target-count',
      ),
    ).toBe(true)
    expect(
      SRD_521_SPELL_MODELING_MANIFEST['ice-knife']?.gaps?.some(
        (gap) => gap.code === 'chained-targets',
      ),
    ).toBe(true)
    expect(SRD_521_SPELL_MODELING_MANIFEST.fireball?.gaps).toBeUndefined()
  })
})

describe('deriveResolutionFromSpell area inference', () => {
  it('infers point mode for distance-range save spells with spell-level area', () => {
    const spell = spellBySlug('fireball')
    const resolution = deriveResolutionFromSpell(spell, { saveAbility: 'dex' })
    expect(resolution.selectionMode).toBe('point')
  })

  it('derives acid-splash point area from manifest override', () => {
    const resolution = resolveSpellSeedResolution(spellBySlug('acid-splash'))
    expect(resolution?.selectionMode).toBe('point')
    expect(resolution?.areaOfEffect).toEqual({
      shape: 'sphere',
      radius: { value: 5, unit: 'ft' },
    })
  })
})
