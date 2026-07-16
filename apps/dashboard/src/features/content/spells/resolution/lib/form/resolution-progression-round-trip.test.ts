import { describe, expect, it } from 'vitest'

import {
  FIRE_BOLT_PROGRESSION,
  FIREBALL_PROGRESSION,
  MAGIC_MISSILE_PROGRESSION,
  SPELL_RESOLUTION_PROGRESSION_FIXTURES,
} from '@rpg/contracts'

import { resolutionToForm, resolutionToStored } from './resolution-form-values'

describe('resolution progression round-trip', () => {
  for (const slug of ['fire-bolt', 'fireball', 'magic-missile', 'eldritch-blast'] as const) {
    it(`${slug}: hydrates and stores progression tracks`, () => {
      const fixture = SPELL_RESOLUTION_PROGRESSION_FIXTURES[slug]
      const resolution = {
        ...fixture.resolution,
        progression: fixture.progression,
      }

      const form = resolutionToForm(resolution)
      expect(form?.progressionBasis).toBe(fixture.progression.basis)
      expect(form?.progressionTracks?.length).toBe(fixture.progression.tracks.length)

      const stored = resolutionToStored(form)
      expect(stored?.progression).toEqual(fixture.progression)
    })
  }

  it('omits progression when tracks are cleared', () => {
    const form = resolutionToForm({
      ...SPELL_RESOLUTION_PROGRESSION_FIXTURES.fireball.resolution,
      progression: FIREBALL_PROGRESSION,
    })
    const cleared = { ...form!, progressionBasis: undefined, progressionTracks: undefined }
    expect(resolutionToStored(cleared)?.progression).toBeUndefined()
  })

  it('preserves fire-bolt cantrip threshold dice faces from base effect', () => {
    const form = resolutionToForm({
      ...SPELL_RESOLUTION_PROGRESSION_FIXTURES['fire-bolt'].resolution,
      progression: FIRE_BOLT_PROGRESSION,
    })
    const tier5 = form?.progressionTracks?.[0]?.entries?.find((entry) => entry.threshold === 5)
    expect(tier5?.roll?.dice?.faces).toBe(10)
  })

  it('preserves magic-missile linear projectile increment', () => {
    const form = resolutionToForm({
      ...SPELL_RESOLUTION_PROGRESSION_FIXTURES['magic-missile'].resolution,
      progression: MAGIC_MISSILE_PROGRESSION,
    })
    const track = form?.progressionTracks?.[0]
    expect(track?.incrementKind).toBe('count')
    expect(track?.incrementCount).toBe(1)
  })
})
