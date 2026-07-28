import { describe, expect, it } from 'vitest'
import { type z } from 'zod'

import {
  DEFAULT_CANTrip_SCALING_THRESHOLDS,
  SRD_CANTrip_SCALING_THRESHOLDS,
} from '../../../../vocab/mechanics/cantrip-scaling-thresholds'
import { spellResolutionSchema, SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID } from '../schema'
import {
  BLESS_PROGRESSION_FIXTURE_RESOLUTION,
  BLESS_TARGET_COUNT_PROGRESSION,
  ELDRITCH_BLAST_PROGRESSION,
  ELDRITCH_BLAST_WITH_PROJECTILES_RESOLUTION,
  FIRE_BOLT_PROGRESSION,
  FIREBALL_PROGRESSION,
  SPELL_RESOLUTION_PROGRESSION_FIXTURES,
} from './fixtures'
import { formatPerProjectileDamageLine, formatResolutionProgressionSummary } from './format'
import { listCompatibleProgressionReferences, readProgressionBaseValue } from './references'
import {
  resolveLinearValueAtSlot,
  resolveProgressionValueAtCharacterLevel,
  resolveProgressionValueAtSlotLevel,
} from './resolve'
import { spellResolutionProgressionSchema } from './schema'
import { validateSpellResolutionProgression } from './validation'

function collectValidationMessages(
  resolution: Parameters<typeof validateSpellResolutionProgression>[0],
  progression: Parameters<typeof validateSpellResolutionProgression>[1],
  options?: Parameters<typeof validateSpellResolutionProgression>[3],
): string[] {
  const messages: string[] = []

  validateSpellResolutionProgression(
    resolution,
    progression,
    {
      value: progression,
      issues: [],
      addIssue: (issue) => {
        if (typeof issue === 'string') {
          messages.push(issue)
          return
        }
        if (issue.message) messages.push(issue.message)
      },
    } as z.RefinementCtx,
    options,
  )

  return messages
}

describe('cantrip scaling thresholds vocabulary', () => {
  it('ships SRD default tiers 5 / 11 / 17', () => {
    expect(SRD_CANTrip_SCALING_THRESHOLDS).toEqual([5, 11, 17])
    expect(DEFAULT_CANTrip_SCALING_THRESHOLDS).toEqual([5, 11, 17])
  })
})

describe('spellResolutionProgressionSchema', () => {
  it('parses representative progression fixtures', () => {
    for (const fixture of Object.values(SPELL_RESOLUTION_PROGRESSION_FIXTURES)) {
      expect(spellResolutionProgressionSchema.parse(fixture.progression)).toEqual(
        fixture.progression,
      )
    }
  })
})

describe('spellResolutionSchema with progression', () => {
  it('accepts resolution envelopes that include progression tracks', () => {
    for (const fixture of Object.values(SPELL_RESOLUTION_PROGRESSION_FIXTURES)) {
      const parsed = spellResolutionSchema.parse({
        ...fixture.resolution,
        progression: fixture.progression,
      })
      expect(parsed.progression).toEqual(fixture.progression)
    }
  })

  it('rejects character-level progression on a leveled spell when spell level is validated', () => {
    const { resolution, progression } = SPELL_RESOLUTION_PROGRESSION_FIXTURES.fireball
    const messages = collectValidationMessages({ ...resolution, progression }, progression, {
      spellLevel: 3,
    })

    expect(messages.some((message) => message.includes('cantrip'))).toBe(false)
  })

  it('rejects cantrip thresholds that do not match the ruleset tier list', () => {
    const badProgression = spellResolutionProgressionSchema.parse({
      ...FIRE_BOLT_PROGRESSION,
      tracks: [
        {
          kind: 'thresholds',
          reference: FIRE_BOLT_PROGRESSION.tracks[0]!.reference,
          entries: [
            { threshold: 6, value: { kind: 'roll', roll: { dice: { count: 2, faces: 10 } } } },
          ],
        },
      ],
    })

    const messages = collectValidationMessages(
      {
        ...SPELL_RESOLUTION_PROGRESSION_FIXTURES['fire-bolt'].resolution,
        progression: badProgression,
      },
      badProgression,
    )

    expect(messages.some((message) => message.includes('ruleset tiers'))).toBe(true)
  })

  it('rejects flat-only linear roll increments', () => {
    const badProgression = spellResolutionProgressionSchema.parse({
      basis: 'spell-slot-level',
      tracks: [
        {
          kind: 'linear',
          reference: FIREBALL_PROGRESSION.tracks[0]!.reference,
          increment: { kind: 'roll', roll: { flat: 5 } },
        },
      ],
    })

    const messages = collectValidationMessages(
      {
        ...SPELL_RESOLUTION_PROGRESSION_FIXTURES.fireball.resolution,
        progression: badProgression,
      },
      badProgression,
    )

    expect(messages.some((message) => message.includes('Flat-only'))).toBe(true)
  })
})

describe('progression resolvers', () => {
  it('resolves cantrip damage thresholds as resolved totals with fill-forward', () => {
    const track = FIRE_BOLT_PROGRESSION.tracks[0]
    expect(track?.kind).toBe('thresholds')
    if (track?.kind !== 'thresholds') return

    const base = { kind: 'roll' as const, roll: { dice: { count: 1, faces: 10 as const } } }
    const entries = track.entries

    expect(resolveProgressionValueAtCharacterLevel(base, entries, 1)).toEqual(base)
    expect(resolveProgressionValueAtCharacterLevel(base, entries, 7)).toEqual({
      kind: 'roll',
      roll: { dice: { count: 2, faces: 10 } },
    })
    expect(resolveProgressionValueAtCharacterLevel(base, entries, 17)).toEqual({
      kind: 'roll',
      roll: { dice: { count: 4, faces: 10 } },
    })
  })

  it('resolves linear slot scaling cumulatively from base', () => {
    const base = { kind: 'roll' as const, roll: { dice: { count: 8, faces: 6 as const } } }
    const increment = { kind: 'roll' as const, roll: { dice: { count: 1, faces: 6 as const } } }

    expect(resolveLinearValueAtSlot(base, increment, 3, 3)).toEqual(base)
    expect(resolveLinearValueAtSlot(base, increment, 3, 5)).toEqual({
      kind: 'roll',
      roll: { dice: { count: 10, faces: 6 } },
    })
  })

  it('resolves linear target count increments from base count', () => {
    const track = BLESS_TARGET_COUNT_PROGRESSION.tracks[0]
    expect(track?.kind).toBe('linear')
    if (track?.kind !== 'linear') return

    const base = readProgressionBaseValue(BLESS_PROGRESSION_FIXTURE_RESOLUTION, track.reference)!
    const increment = track.increment

    expect(resolveProgressionValueAtSlotLevel(base, increment, 1, 1)).toEqual({
      kind: 'count',
      count: 3,
    })
    expect(resolveProgressionValueAtSlotLevel(base, increment, 1, 3)).toEqual({
      kind: 'count',
      count: 5,
    })
  })

  it('resolves cantrip beam thresholds as total projectile counts', () => {
    const track = ELDRITCH_BLAST_PROGRESSION.tracks[0]
    expect(track?.kind).toBe('thresholds')
    if (track?.kind !== 'thresholds') return

    const base = readProgressionBaseValue(
      ELDRITCH_BLAST_WITH_PROJECTILES_RESOLUTION,
      track.reference,
    )!
    const entries = track.entries

    expect(resolveProgressionValueAtCharacterLevel(base, entries, 5)).toEqual({
      kind: 'count',
      count: 2,
    })
  })
})

describe('progression formatters', () => {
  it('formats fireball linear slot scaling summary', () => {
    const { resolution, progression, spellLevel } = SPELL_RESOLUTION_PROGRESSION_FIXTURES.fireball
    const lines = formatResolutionProgressionSummary(resolution, progression, {
      spellLevel,
      castSlotLevel: 5,
    })

    expect(lines.join('\n')).toContain('8d6 Fire damage')
    expect(lines.join('\n')).toContain('Each slot above 3rd: +1d6 Fire damage')
    expect(lines.join('\n')).toContain('At slot level 5: 10d6 Fire damage')
  })

  it('never aggregates magic missile dart damage into a single roll', () => {
    const { resolution, progression, spellLevel } =
      SPELL_RESOLUTION_PROGRESSION_FIXTURES['magic-missile']
    const track = progression.tracks[0]
    expect(track?.kind).toBe('linear')
    if (track?.kind !== 'linear') return

    const base = readProgressionBaseValue(resolution, track.reference)!
    const atSlot3 = resolveProgressionValueAtSlotLevel(base, track.increment, spellLevel, 3)

    expect(atSlot3).toEqual({ kind: 'count', count: 5 })
    expect(atSlot3.kind === 'count' ? atSlot3.count : 0).toBe(5)
    expect(formatPerProjectileDamageLine(resolution, 5)).toContain('5 darts, each dealing')
    expect(formatPerProjectileDamageLine(resolution, 5)).toContain('1d4')
    expect(formatPerProjectileDamageLine(resolution, 5)).toContain('Force damage')
    expect(formatPerProjectileDamageLine(resolution, 5)).not.toContain('5d4')
  })
})

describe('progression references', () => {
  it('lists compatible references from a resolution snapshot', () => {
    const refs = listCompatibleProgressionReferences(ELDRITCH_BLAST_WITH_PROJECTILES_RESOLUTION)
    const properties = refs.map((entry) => entry.reference.property)

    expect(properties).toContain('roll')
    expect(properties).toContain('projectile-count')
  })

  it('reads base roll from a referenced damage effect', () => {
    const reference = {
      subject: { kind: 'effect' as const, effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID },
      property: 'roll' as const,
    }
    const base = readProgressionBaseValue(
      SPELL_RESOLUTION_PROGRESSION_FIXTURES.fireball.resolution,
      reference,
    )

    expect(base).toEqual({
      kind: 'roll',
      roll: { dice: { count: 8, faces: 6 } },
    })
  })
})
