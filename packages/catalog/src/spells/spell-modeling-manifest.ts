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

/** Reviewed prose-only with documented promotion blockers — no explicit status. */
function reviewedProseOnlyWithGaps(gaps: readonly ModelingGapEntry[]): ContentModeling {
  return {
    reviewedAt: SRD_521_SPELL_MODELING_REVIEWED_AT,
    gaps: [...gaps],
  }
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
  'burning-hands': editorEligible([
    {
      code: 'flammability-rules',
      note: 'Flammable object ignition rider stays prose',
    },
  ]),
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
    {
      code: 'unconditional-application',
      note: 'Cold burst applies regardless of attack outcome',
    },
  ]),
  'inflict-wounds': editorEligible(),
  'magic-missile': editorEligible([
    {
      code: 'projectile-target-allocation',
      note: 'Each dart may select a distinct creature within range',
    },
    {
      code: 'dynamic-target-count',
      note: 'Dart count scales with spell slot level',
    },
  ]),
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
  thunderwave: editorEligible([
    {
      code: 'conditional-effect-model-missing',
      note: 'Push on failed save stays prose',
    },
    {
      code: 'object-state-awareness',
      note: 'Unsecured object push rider stays prose',
    },
  ]),
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
  bless: reviewedProseOnlyWithGaps([
    {
      code: 'effect-schema-missing',
      note: 'Capability: stat-modifier — +1d4 attack and save bonus',
    },
    {
      code: 'dynamic-target-count',
      note: 'Slot +1 target per level above 1',
    },
  ]),
  contingency: reviewedProseOnly(),
  counterspell: reviewedProseOnly(),
  'create-or-destroy-water': reviewedProseOnlyWithGaps([
    {
      code: 'multi-mode-choice',
      note: 'Create Water vs Destroy Water modes stay prose',
    },
    {
      code: 'progression-schema-missing',
      note: 'Cube size and gallon volume slot scaling stay prose',
    },
    {
      code: 'effect-schema-missing',
      note: 'Capability: utility — creation and destruction of water',
    },
  ]),
  'dancing-lights': reviewedProseOnly(),
  darkness: reviewedProseOnly(),
  'death-ward': reviewedProseOnly(),
  'detect-evil-and-good': reviewedProseOnlyWithGaps([
    {
      code: 'effect-schema-missing',
      note: 'Capability: detection — creature-type and Hallow sensing',
    },
  ]),
  'detect-magic': reviewedProseOnlyWithGaps([
    {
      code: 'effect-schema-missing',
      note: 'Capability: detection — magic aura sensing within emanation',
    },
  ]),
  'detect-poison-and-disease': reviewedProseOnlyWithGaps([
    {
      code: 'effect-schema-missing',
      note: 'Capability: detection — poison and contagion sensing',
    },
  ]),
  'dispel-magic': reviewedProseOnly(),
  'dragons-breath': reviewedProseOnly(),
  druidcraft: reviewedProseOnly(),
  elementalism: reviewedProseOnly(),
  'expeditious-retreat': reviewedProseOnlyWithGaps([
    {
      code: 'effect-schema-missing',
      note: 'Capability: action-grant — bonus Dash action',
    },
  ]),
  'faerie-fire': reviewedProseOnlyWithGaps([
    {
      code: 'conditional-effect-model-missing',
      note: 'Objects outlined automatically; creatures save for same effect',
    },
    {
      code: 'effect-schema-missing',
      note: 'Capability: condition — outline, advantage, and Invisible negation',
    },
  ]),
  'feather-fall': reviewedProseOnlyWithGaps([
    {
      code: 'reaction-trigger',
      note: 'Cast when a falling creature is seen within range',
    },
    {
      code: 'effect-schema-missing',
      note: 'Capability: movement — fall speed mitigation',
    },
  ]),
  'fog-cloud': reviewedProseOnlyWithGaps([
    {
      code: 'effect-schema-missing',
      note: 'Capability: utility — heavily obscured zone; future environmental-dispersal for wind',
    },
  ]),
  'glyph-of-warding': reviewedProseOnly(),
  'greater-restoration': reviewedProseOnly(),
  guidance: reviewedProseOnly(),
  hex: reviewedProseOnlyWithGaps([
    {
      code: 'effect-schema-missing',
      note: 'Capability: condition — curse, ability disadvantage, extra-damage defer',
    },
    {
      code: 'choice-model-missing',
      note: 'Chosen ability for disadvantage stays prose',
    },
    {
      code: 'retargetable-mark',
      note: 'Mark moves to a new creature when target drops to 0 HP',
    },
    {
      code: 'conditional-effect-model-missing',
      note: 'Extra necrotic damage on hit stays prose',
    },
  ]),
  'hideous-laughter': reviewedProseOnlyWithGaps([
    {
      code: 'conditional-effect-model-missing',
      note: 'Repeating saves and damage-triggered save advantage stay prose',
    },
    {
      code: 'effect-schema-missing',
      note: 'Capability: condition — Prone and Incapacitated on failed save',
    },
  ]),
  'hunters-mark': reviewedProseOnlyWithGaps([
    {
      code: 'effect-schema-missing',
      note: 'Capability: condition — mark, Perception advantage, extra-damage defer',
    },
    {
      code: 'retargetable-mark',
      note: 'Mark moves to a new creature when quarry drops to 0 HP',
    },
    {
      code: 'conditional-effect-model-missing',
      note: 'Extra force damage on hit stays prose',
    },
  ]),
  identify: reviewedProseOnlyWithGaps([
    {
      code: 'effect-schema-missing',
      note: 'Capability: detection — object or creature information reveal on touch',
    },
  ]),
  'illusory-script': reviewedProseOnlyWithGaps([
    {
      code: 'choice-model-missing',
      note: 'Designated viewers at cast time stay prose',
    },
    {
      code: 'effect-schema-missing',
      note: 'Capability: illusion — hidden script and viewer-specific text',
    },
  ]),
  jump: reviewedProseOnlyWithGaps([
    {
      code: 'dynamic-target-count',
      note: 'Slot +1 target per level above 1',
    },
    {
      code: 'effect-schema-missing',
      note: 'Capability: movement — enhanced jump distance',
    },
  ]),
  'lesser-restoration': reviewedProseOnly(),
  levitate: reviewedProseOnly(),
  light: reviewedProseOnly(),
  longstrider: reviewedProseOnlyWithGaps([
    {
      code: 'dynamic-target-count',
      note: 'Slot +1 target per level above 1',
    },
    {
      code: 'effect-schema-missing',
      note: 'Capability: stat-modifier — +10 ft Speed',
    },
  ]),
  'mage-armor': reviewedProseOnlyWithGaps([
    {
      code: 'object-state-awareness',
      note: 'Target must not be wearing armor',
    },
    {
      code: 'conditional-effect-model-missing',
      note: 'Spell ends early if target dons armor',
    },
    {
      code: 'effect-schema-missing',
      note: 'Capability: stat-modifier — base AC formula',
    },
  ]),
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
  'purify-food-and-drink': reviewedProseOnlyWithGaps([
    {
      code: 'object-state-awareness',
      note: 'Nonmagical food and drink in sphere',
    },
    {
      code: 'effect-schema-missing',
      note: 'Capability: utility — purify poison and rot',
    },
  ]),
  'ray-of-enfeeblement': reviewedProseOnly(),
  reincarnate: reviewedProseOnly(),
  resistance: reviewedProseOnly(),
  revivify: reviewedProseOnly(),
  sanctuary: reviewedProseOnlyWithGaps([
    {
      code: 'targeting-model-missing',
      note: 'Attackers must save before targeting warded creature',
    },
    {
      code: 'conditional-effect-model-missing',
      note: 'Ward ends when warded creature attacks or deals damage',
    },
    {
      code: 'effect-schema-missing',
      note: 'Capability: condition — ward against targeted attacks',
    },
  ]),
  shield: reviewedProseOnlyWithGaps([
    {
      code: 'reaction-trigger',
      note: 'Cast when hit by attack or targeted by Magic Missile',
    },
    {
      code: 'conditional-effect-model-missing',
      note: 'Magic Missile immunity rider stays prose',
    },
    {
      code: 'effect-schema-missing',
      note: 'Capability: stat-modifier — +5 AC reaction ward',
    },
  ]),
  'shield-of-faith': reviewedProseOnlyWithGaps([
    {
      code: 'effect-schema-missing',
      note: 'Capability: stat-modifier — +2 AC buff',
    },
  ]),
  'silent-image': reviewedProseOnlyWithGaps([
    {
      code: 'moving-aura-origin',
      note: 'Image relocates with Magic action',
    },
    {
      code: 'effect-schema-missing',
      note: 'Capability: illusion — visual-only phenomenon',
    },
  ]),
  simulacrum: reviewedProseOnly(),
  sleep: reviewedProseOnlyWithGaps([
    {
      code: 'conditional-effect-model-missing',
      note: 'Multi-stage save, damage wake, and shake action stay prose',
    },
    {
      code: 'effect-schema-missing',
      note: 'Capability: condition — HP-ordered area allocation; future ordered-area-allocation',
    },
  ]),
  'spare-the-dying': reviewedProseOnly(),
  'speak-with-animals': reviewedProseOnlyWithGaps([
    {
      code: 'effect-schema-missing',
      note: 'Capability: utility — Beast communication and Influence',
    },
  ]),
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
