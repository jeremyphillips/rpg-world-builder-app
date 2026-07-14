/**
 * Resolution seed manifest for SRD 5.2.1 catalog spells.
 *
 * Declares which structured-effect slugs receive a `spell.resolution` envelope on
 * the read model and how that envelope is produced. Mirrors the pattern in
 * `spell-seed-effects.ts`: manifest here, materialize into `level-*.json` via
 * `packages/catalog/scripts/apply-spell-seed-resolution.mjs`.
 *
 * Each manifest row is one of:
 * - `full` — hand-authored `SpellResolution` (contract fixtures)
 * - `derived` — built by `deriveResolutionFromSpell()` from root `effects[]` plus overrides
 * - `defer` — intentionally no resolution yet; reason codes live in
 *   `spell-resolution-defer-reasons.ts`
 *
 * Migrated spells keep both root `effects[]` and optional `resolution` until a later
 * consolidation phase. Temporary seed manifest — use `resolveSpellSeedResolution()`
 * in tests and `SRD_521_SPELL_SEED_RESOLUTION_SLUGS` for slugs the apply script writes.
 */
import {
  CHILL_TOUCH_RESOLUTION,
  ELDRITCH_BLAST_RESOLUTION,
  INFlict_WOUNDS_RESOLUTION,
  spellResolutionSchema,
  type Spell,
  type SpellResolution,
} from '@rpg/contracts'

import {
  deriveResolutionFromSpell,
  type ResolutionDerivationOverrides,
} from './lib/derive-resolution-from-spell'
import type { SpellResolutionDeferReason } from './spell-resolution-defer-reasons'

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
  'acid-splash': { kind: 'derived', overrides: { saveAbility: 'dex' } },
  'sacred-flame': { kind: 'derived', overrides: { saveAbility: 'dex' } },
  'burning-hands': {
    kind: 'derived',
    overrides: { saveAbility: 'dex', proximity: { kind: 'reach' } },
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
    overrides: { saveAbility: 'con', proximity: { kind: 'reach' } },
  },
  fireball: { kind: 'derived', overrides: { saveAbility: 'dex' } },
  'wall-of-fire': { kind: 'derived', overrides: { saveAbility: 'dex' } },
  'delayed-blast-fireball': { kind: 'derived', overrides: { saveAbility: 'dex' } },

  // Tier B — hybrid resolution + legacy effects[]
  'eldritch-blast': { kind: 'full', resolution: ELDRITCH_BLAST_RESOLUTION },

  // Tier B — explicit deferrals
  'magic-missile': { kind: 'defer', reason: 'automatic-method' },
  hex: { kind: 'defer', reason: 'extra-damage-rider' },
  'hunters-mark': { kind: 'defer', reason: 'extra-damage-rider' },

  // Tier C — multi-damage / choice-model deferrals
  'ice-knife': { kind: 'defer', reason: 'multi-effect' },
  'arcane-hand': { kind: 'defer', reason: 'choice-model' },

  // Tier D — healing / temporary hit points
  'cure-wounds': {
    kind: 'derived',
    overrides: { method: { kind: 'automatic' }, target: { kind: 'creature' } },
  },
  'mass-healing-word': {
    kind: 'derived',
    overrides: {
      method: { kind: 'automatic' },
      target: { count: 6, kind: 'creature' },
    },
  },
  'mass-cure-wounds': {
    kind: 'derived',
    overrides: {
      method: { kind: 'automatic' },
      target: { count: 6, kind: 'creature' },
    },
  },
  'false-life': {
    kind: 'derived',
    overrides: { method: { kind: 'automatic' }, target: { kind: 'creature' } },
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
