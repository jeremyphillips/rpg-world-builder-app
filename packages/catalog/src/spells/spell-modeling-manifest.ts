/**
 * Human-reviewed spell modeling manifest for SRD 5.2.1 catalog seeds.
 *
 * Source of truth for `modeling` metadata on seed JSON — apply via
 * `packages/catalog/scripts/apply-spell-modeling-metadata.mjs`.
 *
 * Promotion rules:
 * - Resolution seeds with editor round-trip support → `meaningful-partial` (+ gaps when prose riders remain)
 * - Terminal prose-only spells → `reviewedAt` only (derived `prose-only`)
 */
import type { ContentModeling, ModelingGapEntry } from '@rpg/contracts'

import { SRD_521_SPELL_SEED_RESOLUTION_SLUGS } from './spell-seed-resolution'

/** ISO datetime shared across the initial SRD 5.2.1 modeling audit. */
export const SRD_521_SPELL_MODELING_REVIEWED_AT = '2026-07-15T00:00:00.000Z' as const

function reviewedProseOnly(): ContentModeling {
  return { reviewedAt: SRD_521_SPELL_MODELING_REVIEWED_AT }
}

function editorEligible(gaps?: readonly ModelingGapEntry[]): ContentModeling {
  if (gaps && gaps.length > 0) {
    return {
      reviewedAt: SRD_521_SPELL_MODELING_REVIEWED_AT,
      status: 'meaningful-partial',
      gaps: [...gaps],
    }
  }
  return {
    reviewedAt: SRD_521_SPELL_MODELING_REVIEWED_AT,
    status: 'meaningful-partial',
  }
}

/** Editor-eligible resolution spells — form round-trip verified in dashboard tests. */
const SRD_521_SPELL_MODELING_RESOLUTION_ENTRIES = {
  'acid-splash': editorEligible(),
  'arcane-hand': editorEligible([
    {
      code: 'multi-mode-choice',
      note: 'Forceful Hand and Interposing Hand modes stay prose',
    },
  ]),
  'burning-hands': editorEligible(),
  'chill-touch': editorEligible([
    {
      code: 'conditional-effect-model-missing',
      note: "Target can't regain Hit Points rider stays prose",
    },
  ]),
  'cure-wounds': editorEligible([
    {
      code: 'modifier-model-missing',
      note: 'Spellcasting ability modifier on healing stays prose',
    },
  ]),
  'delayed-blast-fireball': editorEligible(),
  'eldritch-blast': editorEligible([
    {
      code: 'dynamic-target-count',
      note: 'Beam count scales with character level',
    },
  ]),
  'false-life': editorEligible(),
  fireball: editorEligible(),
  'fire-bolt': editorEligible([
    {
      code: 'flammability-rules',
      note: 'Object ignition rider stays prose',
    },
  ]),
  'hellish-rebuke': editorEligible([
    {
      code: 'reaction-trigger',
      note: 'Damaging creature target implied by reaction trigger',
    },
  ]),
  'ice-knife': editorEligible([
    {
      code: 'chained-targets',
      note: 'Cold burst targets derived from primary hit or miss',
    },
  ]),
  'inflict-wounds': editorEligible(),
  'magic-missile': editorEligible(),
  'mass-cure-wounds': editorEligible([
    {
      code: 'modifier-model-missing',
      note: 'Spellcasting ability modifier on healing stays prose',
    },
  ]),
  'mass-healing-word': editorEligible([
    {
      code: 'modifier-model-missing',
      note: 'Spellcasting ability modifier on healing stays prose',
    },
  ]),
  'poison-spray': editorEligible(),
  'ray-of-sickness': editorEligible([
    {
      code: 'conditional-effect-model-missing',
      note: 'Poisoned condition rider stays prose',
    },
  ]),
  'sacred-flame': editorEligible([
    {
      code: 'conditional-effect-model-missing',
      note: 'Cover negation rider stays prose',
    },
  ]),
  thunderwave: editorEligible(),
  'wall-of-fire': editorEligible([
    {
      code: 'wall-or-path-geometry',
      note: 'Wall placement and ongoing side damage stay prose',
    },
  ]),
} as const satisfies Record<string, ContentModeling>

/** Terminal prose-only spells — reviewed with no explicit status. */
const SRD_521_SPELL_MODELING_PROSE_ONLY_ENTRIES = {
  aid: reviewedProseOnly(),
  'animate-dead': reviewedProseOnly(),
  'animate-objects': reviewedProseOnly(),
  'antimagic-field': reviewedProseOnly(),
  'aura-of-life': reviewedProseOnly(),
  'bestow-curse': reviewedProseOnly(),
  bless: reviewedProseOnly(),
  contingency: reviewedProseOnly(),
  counterspell: reviewedProseOnly(),
  'create-or-destroy-water': reviewedProseOnly(),
  'dancing-lights': reviewedProseOnly(),
  darkness: reviewedProseOnly(),
  'death-ward': reviewedProseOnly(),
  'detect-evil-and-good': reviewedProseOnly(),
  'detect-magic': reviewedProseOnly(),
  'detect-poison-and-disease': reviewedProseOnly(),
  'dispel-magic': reviewedProseOnly(),
  'dragons-breath': reviewedProseOnly(),
  druidcraft: reviewedProseOnly(),
  elementalism: reviewedProseOnly(),
  'expeditious-retreat': reviewedProseOnly(),
  'faerie-fire': reviewedProseOnly(),
  'feather-fall': reviewedProseOnly(),
  'fog-cloud': reviewedProseOnly(),
  'glyph-of-warding': reviewedProseOnly(),
  'greater-restoration': reviewedProseOnly(),
  guidance: reviewedProseOnly(),
  hex: reviewedProseOnly(),
  'hideous-laughter': reviewedProseOnly(),
  'hunters-mark': reviewedProseOnly(),
  identify: reviewedProseOnly(),
  'illusory-script': reviewedProseOnly(),
  jump: reviewedProseOnly(),
  'lesser-restoration': reviewedProseOnly(),
  levitate: reviewedProseOnly(),
  light: reviewedProseOnly(),
  longstrider: reviewedProseOnly(),
  'mage-armor': reviewedProseOnly(),
  'mage-hand': reviewedProseOnly(),
  'magic-jar': reviewedProseOnly(),
  'mass-suggestion': reviewedProseOnly(),
  mending: reviewedProseOnly(),
  message: reviewedProseOnly(),
  'minor-illusion': reviewedProseOnly(),
  'misty-step': reviewedProseOnly(),
  'pass-without-trace': reviewedProseOnly(),
  'planar-binding': reviewedProseOnly(),
  polymorph: reviewedProseOnly(),
  'power-word-heal': reviewedProseOnly(),
  prestidigitation: reviewedProseOnly(),
  'prismatic-wall': reviewedProseOnly(),
  'purify-food-and-drink': reviewedProseOnly(),
  'ray-of-enfeeblement': reviewedProseOnly(),
  reincarnate: reviewedProseOnly(),
  resistance: reviewedProseOnly(),
  revivify: reviewedProseOnly(),
  sanctuary: reviewedProseOnly(),
  shield: reviewedProseOnly(),
  'shield-of-faith': reviewedProseOnly(),
  'silent-image': reviewedProseOnly(),
  simulacrum: reviewedProseOnly(),
  sleep: reviewedProseOnly(),
  'spare-the-dying': reviewedProseOnly(),
  'speak-with-animals': reviewedProseOnly(),
  'summon-dragon': reviewedProseOnly(),
  symbol: reviewedProseOnly(),
  telekinesis: reviewedProseOnly(),
  thaumaturgy: reviewedProseOnly(),
  'true-polymorph': reviewedProseOnly(),
  'true-strike': reviewedProseOnly(),
  wish: reviewedProseOnly(),
} as const satisfies Record<string, ContentModeling>

export const SRD_521_SPELL_MODELING_MANIFEST = {
  ...SRD_521_SPELL_MODELING_RESOLUTION_ENTRIES,
  ...SRD_521_SPELL_MODELING_PROSE_ONLY_ENTRIES,
} as const satisfies Record<string, ContentModeling>

export type Srd521SpellModelingManifestSlug = keyof typeof SRD_521_SPELL_MODELING_MANIFEST

export const SRD_521_SPELL_MODELING_MANIFEST_SLUGS = Object.keys(
  SRD_521_SPELL_MODELING_MANIFEST,
) as Srd521SpellModelingManifestSlug[]

/** Slugs promoted to `meaningful-partial` for resolution editor eligibility. */
export const SRD_521_SPELL_MODELING_EDITOR_ELIGIBLE_SLUGS = SRD_521_SPELL_SEED_RESOLUTION_SLUGS
