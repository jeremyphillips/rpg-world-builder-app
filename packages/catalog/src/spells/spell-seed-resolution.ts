import {
  CHILL_TOUCH_RESOLUTION,
  INFlict_WOUNDS_RESOLUTION,
  spellResolutionSchema,
  type Spell,
  type SpellResolution,
} from '@rpg/contracts'

import {
  deriveResolutionFromSpell,
  type ResolutionDerivationOverrides,
} from './lib/derive-resolution-from-spell'

export type SpellSeedResolutionFullEntry = {
  kind: 'full'
  resolution: SpellResolution
}

export type SpellSeedResolutionDerivedEntry = {
  kind: 'derived'
  overrides: ResolutionDerivationOverrides
}

export type SpellSeedResolutionEntry =
  | SpellSeedResolutionFullEntry
  | SpellSeedResolutionDerivedEntry

/**
 * Tier A resolution seeds for SRD 5.2.1 — single primary damage, attack or save preset.
 * Coexists with flat `effects[]`; see spell-seed-effects.ts.
 */
export const SRD_521_SPELL_SEED_RESOLUTION = {
  'chill-touch': { kind: 'full', resolution: CHILL_TOUCH_RESOLUTION },
  'inflict-wounds': { kind: 'full', resolution: INFlict_WOUNDS_RESOLUTION },
  'fire-bolt': { kind: 'derived', overrides: {} },
  'poison-spray': { kind: 'derived', overrides: {} },
  'ray-of-sickness': { kind: 'derived', overrides: {} },
  'acid-splash': { kind: 'derived', overrides: { saveAbility: 'dex' } },
  'sacred-flame': { kind: 'derived', overrides: { saveAbility: 'dex' } },
  'burning-hands': {
    kind: 'derived',
    overrides: { saveAbility: 'dex', range: { kind: 'reach' } },
  },
  'hellish-rebuke': {
    kind: 'derived',
    overrides: {
      saveAbility: 'dex',
      target: { count: 1, kind: 'creature' },
    },
  },
  thunderwave: {
    kind: 'derived',
    overrides: { saveAbility: 'con', range: { kind: 'reach' } },
  },
  fireball: { kind: 'derived', overrides: { saveAbility: 'dex' } },
  'wall-of-fire': { kind: 'derived', overrides: { saveAbility: 'dex' } },
  'delayed-blast-fireball': { kind: 'derived', overrides: { saveAbility: 'dex' } },
} as const satisfies Record<string, SpellSeedResolutionEntry>

export type Srd521SpellSeedResolutionSlug = keyof typeof SRD_521_SPELL_SEED_RESOLUTION

export const SRD_521_SPELL_SEED_RESOLUTION_SLUGS = Object.keys(
  SRD_521_SPELL_SEED_RESOLUTION,
) as Srd521SpellSeedResolutionSlug[]

/** Resolves manifest entry to a contract envelope for a loaded seed spell. */
export function resolveSpellSeedResolution(spell: Spell): SpellResolution | undefined {
  const entry = SRD_521_SPELL_SEED_RESOLUTION[spell.slug as Srd521SpellSeedResolutionSlug]
  if (!entry) return undefined

  if (entry.kind === 'full') return entry.resolution

  return deriveResolutionFromSpell(spell, entry.overrides)
}

/** Validates full manifest entries against the contract schema at module load. */
for (const entry of Object.values(SRD_521_SPELL_SEED_RESOLUTION)) {
  if (entry.kind === 'full') {
    spellResolutionSchema.parse(entry.resolution)
  }
}
