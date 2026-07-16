/**
 * Resolution seed manifest for SRD 5.2.1 catalog spells.
 *
 * Declares which slugs receive a `spell.resolution` envelope on the read model and
 * how that envelope is produced. Materialize into `level-*.json` via
 * `packages/catalog/scripts/apply-spell-seed-resolution.mjs`.
 *
 * Each manifest row is one of:
 * - `full` — hand-authored `SpellResolution` (contract fixtures)
 * - `derived` — built by `deriveResolutionFromSpell()` from derivation snapshots plus overrides
 * - `defer` — intentionally no resolution yet; documented defer reason codes below
 */
import {
  ARCANE_HAND_RESOLUTION,
  CHILL_TOUCH_RESOLUTION,
  ELDRITCH_BLAST_RESOLUTION,
  ICE_KNIFE_RESOLUTION,
  INFlict_WOUNDS_RESOLUTION,
  MAGIC_MISSILE_RESOLUTION,
  spellResolutionSchema,
  type Spell,
  type SpellResolution,
} from '@rpg/contracts'

import {
  deriveResolutionFromSpell,
  type ResolutionDerivationOverrides,
} from './lib/derive-resolution-from-spell'

/** Documented deferral reason codes for `kind: 'defer'` manifest rows. */
export const SPELL_RESOLUTION_DEFER_REASONS = {
  'automatic-method':
    'Requires resolution method automatic (e.g. Magic Missile) before envelope modeling.',
  'extra-damage-rider':
    'Primary mechanics are non-damage; extra damage is a rider (e.g. Hex, Hunter’s Mark).',
  'multi-effect': 'Multiple damage effects need per-outcome effect linking (e.g. Ice Knife).',
  'choice-model': 'Choice-dependent modes and multiple labeled damage effects (e.g. Arcane Hand).',
  'unsupported-effect-kind':
    'Legacy defer code — healing and temporary hit points are supported as of Tier D.',
  'placeholder-damage':
    'Placeholder flat-zero damage rider is not a real resolution envelope (e.g. True Strike).',
} as const

export type SpellResolutionDeferReason = keyof typeof SPELL_RESOLUTION_DEFER_REASONS

export type SpellSeedResolutionFullEntry = {
  kind: 'full'
  resolution: SpellResolution
}

export type SpellSeedResolutionDerivedEntry = {
  kind: 'derived'
  overrides: ResolutionDerivationOverrides
}

export type SpellSeedResolutionDeferEntry = {
  kind: 'defer'
  reason: SpellResolutionDeferReason
}

export type SpellSeedResolutionEntry =
  | SpellSeedResolutionFullEntry
  | SpellSeedResolutionDerivedEntry
  | SpellSeedResolutionDeferEntry

/**
 * Resolution seeds for SRD 5.2.1 — Tier A–D applicable entries plus explicit deferrals.
 * See the file-level JSDoc above for manifest shape and apply workflow.
 */
export const SRD_521_SPELL_SEED_RESOLUTION = {
  // Tier A — single primary damage
  'chill-touch': { kind: 'full', resolution: CHILL_TOUCH_RESOLUTION },
  'inflict-wounds': { kind: 'full', resolution: INFlict_WOUNDS_RESOLUTION },
  'fire-bolt': { kind: 'derived', overrides: {} },
  'poison-spray': { kind: 'derived', overrides: {} },
  'ray-of-sickness': { kind: 'derived', overrides: {} },
  'acid-splash': {
    kind: 'derived',
    overrides: {
      saveAbility: 'dex',
      selectionMode: 'point',
      areaOfEffect: { shape: 'sphere', radius: { value: 5, unit: 'ft' } },
    },
  },
  'sacred-flame': { kind: 'derived', overrides: { saveAbility: 'dex' } },
  'burning-hands': {
    kind: 'derived',
    overrides: { saveAbility: 'dex', selectionMode: 'self' },
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
    overrides: {
      saveAbility: 'con',
      selectionMode: 'self',
      areaOfEffect: { shape: 'cube', size: { value: 15, unit: 'ft' } },
    },
  },
  fireball: { kind: 'derived', overrides: { saveAbility: 'dex' } },
  'wall-of-fire': { kind: 'derived', overrides: { saveAbility: 'dex' } },
  'delayed-blast-fireball': { kind: 'derived', overrides: { saveAbility: 'dex' } },

  // Tier B — hybrid resolution + legacy effects[]
  'eldritch-blast': { kind: 'full', resolution: ELDRITCH_BLAST_RESOLUTION },
  'magic-missile': { kind: 'full', resolution: MAGIC_MISSILE_RESOLUTION },

  // Tier B — explicit deferrals
  hex: { kind: 'defer', reason: 'extra-damage-rider' },
  'hunters-mark': { kind: 'defer', reason: 'extra-damage-rider' },

  // Tier C — multi-damage spells
  'ice-knife': { kind: 'full', resolution: ICE_KNIFE_RESOLUTION },
  'arcane-hand': { kind: 'full', resolution: ARCANE_HAND_RESOLUTION },

  // Tier D — healing / temporary hit points
  'cure-wounds': {
    kind: 'derived',
    overrides: { method: { kind: 'automatic' }, target: { kind: 'creature' } },
  },
  'mass-healing-word': {
    kind: 'derived',
    overrides: {
      method: { kind: 'automatic' },
      target: { count: 6, countKind: 'up-to', kind: 'creature' },
    },
  },
  'mass-cure-wounds': {
    kind: 'derived',
    overrides: {
      method: { kind: 'automatic' },
      target: { count: 6, countKind: 'up-to', kind: 'creature' },
    },
  },
  'false-life': {
    kind: 'derived',
    overrides: { method: { kind: 'automatic' }, selectionMode: 'self' },
  },

  // Tier D — explicit deferral
  'true-strike': { kind: 'defer', reason: 'placeholder-damage' },
} as const satisfies Record<string, SpellSeedResolutionEntry>

export type Srd521SpellSeedResolutionSlug = keyof typeof SRD_521_SPELL_SEED_RESOLUTION

export const SRD_521_SPELL_SEED_RESOLUTION_MANIFEST_SLUGS = Object.keys(
  SRD_521_SPELL_SEED_RESOLUTION,
) as Srd521SpellSeedResolutionSlug[]

/** Tier A slugs — exactly one primary damage effect, full resolution envelope. */
export const SRD_521_SPELL_SEED_RESOLUTION_TIER_A_SLUGS = [
  'chill-touch',
  'inflict-wounds',
  'fire-bolt',
  'poison-spray',
  'ray-of-sickness',
  'acid-splash',
  'sacred-flame',
  'burning-hands',
  'hellish-rebuke',
  'thunderwave',
  'fireball',
  'wall-of-fire',
  'delayed-blast-fireball',
] as const satisfies readonly Srd521SpellSeedResolutionSlug[]

export type Srd521SpellSeedResolutionTierASlug =
  (typeof SRD_521_SPELL_SEED_RESOLUTION_TIER_A_SLUGS)[number]

function isApplicableResolutionEntry(
  entry: SpellSeedResolutionEntry,
): entry is SpellSeedResolutionFullEntry | SpellSeedResolutionDerivedEntry {
  return entry.kind === 'full' || entry.kind === 'derived'
}

/** Slugs that receive a structured resolution envelope when the apply script runs. */
export const SRD_521_SPELL_SEED_RESOLUTION_SLUGS =
  SRD_521_SPELL_SEED_RESOLUTION_MANIFEST_SLUGS.filter((slug) =>
    isApplicableResolutionEntry(SRD_521_SPELL_SEED_RESOLUTION[slug]),
  )

export const SRD_521_SPELL_SEED_RESOLUTION_DEFERRED_SLUGS =
  SRD_521_SPELL_SEED_RESOLUTION_MANIFEST_SLUGS.filter(
    (slug) => SRD_521_SPELL_SEED_RESOLUTION[slug].kind === 'defer',
  )

/** Returns manifest defer reason when the slug is explicitly deferred. */
export function spellSeedResolutionDeferReason(
  slug: string,
): SpellResolutionDeferReason | undefined {
  const entry = SRD_521_SPELL_SEED_RESOLUTION[slug as Srd521SpellSeedResolutionSlug]
  return entry?.kind === 'defer' ? entry.reason : undefined
}

/** Resolves manifest entry to a contract envelope for a loaded seed spell. */
export function resolveSpellSeedResolution(spell: Spell): SpellResolution | undefined {
  const entry = SRD_521_SPELL_SEED_RESOLUTION[spell.slug as Srd521SpellSeedResolutionSlug]
  if (!entry || entry.kind === 'defer') return undefined

  if (entry.kind === 'full') return entry.resolution

  return deriveResolutionFromSpell(spell, entry.overrides)
}

/** Validates full manifest entries against the contract schema at module load. */
for (const entry of Object.values(SRD_521_SPELL_SEED_RESOLUTION)) {
  if (entry.kind === 'full') {
    spellResolutionSchema.parse(entry.resolution)
  }
}
