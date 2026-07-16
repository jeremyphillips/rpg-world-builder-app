/**
 * Human-reviewed spell modeling manifest for SRD 5.2.1 catalog seeds.
 *
 * Source of truth for `modeling` metadata on seed JSON — apply via
 * `packages/catalog/scripts/apply-spell-modeling-metadata.mjs`.
 *
 * Promotion rules:
 * - Resolution seeds with editor round-trip support → `meaningful-partial` (+ gaps when prose riders remain)
 * - Prose-only spells → `blocker` (+ residual `gaps` when applicable)
 */
import type { ContentModeling, ModelingBlocker, ModelingGapEntry } from '@rpg/contracts'

import { SRD_521_SPELL_SEED_RESOLUTION_SLUGS } from './spell-seed-resolution'

/** ISO datetime shared across the initial SRD 5.2.1 modeling audit (legacy L1 entries). */
export const SRD_521_SPELL_MODELING_REVIEWED_AT = '2026-07-15T00:00:00.000Z' as const

function gap(code: string, note?: string): ModelingGapEntry {
  return note ? { code, note } : { code }
}

function blockedProseOnly(
  blocker: ModelingBlocker,
  gaps?: readonly ModelingGapEntry[],
): ContentModeling {
  const modeling: ContentModeling = { blocker: { ...blocker } }
  if (gaps && gaps.length > 0) {
    modeling.gaps = [...gaps]
  }
  return modeling
}

function editorEligible(gaps?: readonly ModelingGapEntry[]): ContentModeling {
  const modeling: ContentModeling = { status: 'meaningful-partial' }
  if (gaps && gaps.length > 0) {
    modeling.gaps = [...gaps]
  }
  return modeling
}

/** Legacy reviewed marker — L6–9 terminal spells pending blocker backfill. */
function reviewedProseOnly(): ContentModeling {
  return { reviewedAt: SRD_521_SPELL_MODELING_REVIEWED_AT }
}

/** Editor-eligible resolution spells — form round-trip verified in dashboard tests. */
const SRD_521_SPELL_MODELING_RESOLUTION_ENTRIES = {
  'acid-splash': editorEligible(),
  'arcane-hand': editorEligible([
    gap('multi-mode-choice', 'Forceful Hand and Interposing Hand modes stay prose'),
    gap('modifier-model-missing', 'Grasping Hand crush + spellcasting modifier stays prose'),
    gap('conditional-effect-model-missing', 'Grapple, push, and cover modes stay prose'),
    gap('independent-effect-object-model-missing', 'Hand object AC, HP, and duration stay prose'),
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
  fireball: editorEligible([
    gap('flammability-rules', 'Flammable object ignition rider stays prose'),
  ]),
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
    gap('projectile-target-allocation', 'Each dart may select a distinct creature within range'),
    gap(
      'dynamic-target-count',
      'Slot level above 1 adds one projectile (dart), not additional target capacity',
    ),
  ]),
  'mass-cure-wounds': editorEligible([
    gap('modifier-model-missing', 'Spellcasting ability modifier on healing stays prose'),
    gap('chosen-within-area', 'Recipient selection within 30-ft sphere stays prose'),
    gap('progression-schema-missing', 'Slot +1d8 healing scaling stays prose'),
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
    gap('wall-or-path-geometry', 'Wall placement and ongoing side damage stay prose'),
    gap('progression-schema-missing', 'Slot +1d8 damage scaling stays prose'),
  ]),
} as const satisfies Record<string, ContentModeling>

/** Terminal prose-only spells — reviewed with no explicit status. */
const SRD_521_SPELL_MODELING_PROSE_ONLY_ENTRIES = {
  aid: blockedProseOnly({ code: 'effect-schema-missing', capabilityId: 'stat-modifier' }, [
    gap('progression-schema-missing', 'Slot +5 HP scaling stays prose'),
  ]),
  'animate-dead': blockedProseOnly({ code: 'summoning-model-missing' }, [
    gap('choice-model-missing', 'Bones vs corpse choice stays prose'),
    gap('dynamic-target-count', 'Slot +2 undead scaling stays prose'),
    gap('conditional-effect-model-missing', 'Reassert control vs animate stays prose'),
  ]),
  'animate-objects': blockedProseOnly({ code: 'summoning-model-missing' }, [
    gap('object-state-awareness', 'Worn, carried, fixed, and size eligibility stays prose'),
    gap('choice-model-missing', 'Object selection and size weighting stay prose'),
    gap('dynamic-target-count', 'Spellcasting modifier object cap stays prose'),
    gap('progression-schema-missing', 'Slot slam damage scaling stays prose'),
  ]),
  'antimagic-field': reviewedProseOnly(),
  'aura-of-life': blockedProseOnly(
    { code: 'effect-schema-missing', capabilityId: 'stat-modifier' },
    [
      gap(
        'conditional-effect-model-missing',
        '1 HP at turn start when at 0 HP in aura stays prose',
      ),
    ],
  ),
  'bestow-curse': blockedProseOnly({ code: 'effect-schema-missing', capabilityId: 'condition' }, [
    gap('choice-model-missing', 'Curse mode choice stays prose'),
    gap('conditional-effect-model-missing', 'Repeating saves and extra 1d8 rider stay prose'),
    gap('progression-schema-missing', 'Slot duration and concentration rules stay prose'),
  ]),
  bless: blockedProseOnly({ code: 'effect-schema-missing', capabilityId: 'stat-modifier' }, [
    gap('dynamic-target-count', 'Slot +1 target per level above 1'),
  ]),
  contingency: reviewedProseOnly(),
  counterspell: blockedProseOnly(
    { code: 'targeting-model-missing', capabilityId: 'spell-negation' },
    [
      gap('reaction-trigger', 'Interrupt when creature casts stays prose'),
      gap('effect-schema-missing', 'Cast dissipate mechanics stay prose'),
    ],
  ),
  'create-or-destroy-water': blockedProseOnly({ code: 'effect-schema-missing' }, [
    gap('multi-mode-choice', 'Create Water vs Destroy Water modes stay prose'),
    gap('progression-schema-missing', 'Cube size and gallon volume slot scaling stay prose'),
  ]),
  'dancing-lights': blockedProseOnly(
    {
      code: 'independent-effect-object-model-missing',
      note: 'Persistent movable lights — capability must cover controllable constructs',
    },
    [
      gap('multi-mode-choice', 'Four lights vs combined humanlike form stays prose'),
      gap('moving-aura-origin', 'Bonus-action light relocation stays prose'),
      gap(
        'conditional-effect-model-missing',
        'Tether, range vanish, and illusion presentation riders stay prose',
      ),
    ],
  ),
  darkness: blockedProseOnly({ code: 'effect-schema-missing', capabilityId: 'persistent-zone' }, [
    gap('multi-mode-choice', 'Point sphere vs object emanation stays prose'),
    gap('object-state-awareness', 'Object not worn or carried stays prose'),
    gap('conditional-effect-model-missing', 'Dispel lower-level light overlap stays prose'),
  ]),
  'death-ward': blockedProseOnly({ code: 'effect-schema-missing' }, [
    gap(
      'conditional-effect-model-missing',
      '0 HP substitution and instant-death negation stay prose',
    ),
  ]),
  'detect-evil-and-good': blockedProseOnly({
    code: 'effect-schema-missing',
    capabilityId: 'detection',
  }),
  'detect-magic': blockedProseOnly({ code: 'effect-schema-missing', capabilityId: 'detection' }),
  'detect-poison-and-disease': blockedProseOnly({
    code: 'effect-schema-missing',
    capabilityId: 'detection',
  }),
  'dispel-magic': blockedProseOnly(
    { code: 'targeting-model-missing', capabilityId: 'spell-negation' },
    [
      gap('effect-schema-missing', 'End ongoing spell mechanics stay prose'),
      gap('progression-schema-missing', 'Auto-end threshold by slot stays prose'),
    ],
  ),
  'dragons-breath': blockedProseOnly(
    { code: 'effect-schema-missing', capabilityId: 'action-grant' },
    [
      gap('multi-mode-choice', 'Damage type choice stays prose'),
      gap('progression-schema-missing', 'Slot +1d6 damage scaling stays prose'),
      gap('conditional-effect-model-missing', 'Delegated Magic-action breath stays prose'),
    ],
  ),
  druidcraft: blockedProseOnly({ code: 'effect-schema-missing' }, [
    gap('multi-mode-choice', 'Weather, bloom, sensory, and fire-play modes stay prose'),
  ]),
  elementalism: blockedProseOnly({ code: 'effect-schema-missing' }, [
    gap('multi-mode-choice', 'Element beckon and sculpt modes stay prose'),
  ]),
  'expeditious-retreat': blockedProseOnly({
    code: 'effect-schema-missing',
    capabilityId: 'action-grant',
  }),
  'faerie-fire': blockedProseOnly({ code: 'effect-schema-missing', capabilityId: 'condition' }, [
    gap(
      'conditional-effect-model-missing',
      'Creature save vs automatic object outline; may need per-recipient resolution later',
    ),
  ]),
  'feather-fall': blockedProseOnly({ code: 'effect-schema-missing', capabilityId: 'movement' }, [
    gap('reaction-trigger', 'Cast when a falling creature is seen within range'),
  ]),
  'fog-cloud': blockedProseOnly({
    code: 'effect-schema-missing',
    capabilityId: 'persistent-zone',
  }),
  'glyph-of-warding': blockedProseOnly(
    { code: 'effect-schema-missing', capabilityId: 'persistent-zone' },
    [
      gap('multi-mode-choice', 'Explosive rune vs spell glyph stays prose'),
      gap('choice-model-missing', 'Trigger and filter configuration stay prose'),
      gap('conditional-effect-model-missing', 'Triggered burst and stored spell stay prose'),
      gap('progression-schema-missing', 'Slot damage and stored spell level stay prose'),
    ],
  ),
  'greater-restoration': blockedProseOnly(
    { code: 'effect-schema-missing', capabilityId: 'condition' },
    [gap('choice-model-missing', 'Pick effect from list stays prose')],
  ),
  guidance: blockedProseOnly({ code: 'effect-schema-missing', capabilityId: 'stat-modifier' }, [
    gap('choice-model-missing', 'Chosen skill for ability check bonus stays prose'),
  ]),
  hex: blockedProseOnly(
    {
      code: 'effect-schema-missing',
      capabilityId: 'condition',
      note: 'May later split into condition + mark when mark family ships',
    },
    [
      gap('choice-model-missing', 'Chosen ability for disadvantage stays prose'),
      gap('retargetable-mark', 'Mark moves to a new creature when target drops to 0 HP'),
      gap('conditional-effect-model-missing', 'Extra necrotic damage on hit stays prose'),
    ],
  ),
  'hideous-laughter': blockedProseOnly(
    { code: 'effect-schema-missing', capabilityId: 'condition' },
    [
      gap(
        'conditional-effect-model-missing',
        'Repeating saves and damage-triggered save advantage stay prose',
      ),
    ],
  ),
  'hunters-mark': blockedProseOnly(
    {
      code: 'effect-schema-missing',
      capabilityId: 'condition',
      note: 'May later split into condition + mark when mark family ships',
    },
    [
      gap('retargetable-mark', 'Mark moves to a new creature when quarry drops to 0 HP'),
      gap('conditional-effect-model-missing', 'Extra force damage on hit stays prose'),
    ],
  ),
  identify: blockedProseOnly({
    code: 'effect-schema-missing',
    capabilityId: 'information-reveal',
  }),
  'illusory-script': blockedProseOnly({ code: 'effect-schema-missing', capabilityId: 'illusion' }, [
    gap('choice-model-missing', 'Designated viewers at cast time stay prose'),
  ]),
  jump: blockedProseOnly({ code: 'effect-schema-missing', capabilityId: 'movement' }, [
    gap('dynamic-target-count', 'Slot +1 target per level above 1'),
  ]),
  'lesser-restoration': blockedProseOnly(
    { code: 'effect-schema-missing', capabilityId: 'condition' },
    [gap('choice-model-missing', 'Pick condition from list stays prose')],
  ),
  levitate: blockedProseOnly({ code: 'effect-schema-missing', capabilityId: 'movement' }, [
    gap('conditional-effect-model-missing', 'Unwilling Con save stays prose'),
    gap('object-state-awareness', 'Creature vs loose object stays prose'),
  ]),
  light: blockedProseOnly({ code: 'effect-schema-missing' }, [
    gap('object-state-awareness', 'Object not worn or carried stays prose'),
    gap(
      'area-origin-model-missing',
      'Object-attached light origin only — not self/point area geometry',
    ),
    gap('conditional-effect-model-missing', 'Cover blocks light; recast ends prior light'),
  ]),
  longstrider: blockedProseOnly(
    {
      code: 'effect-schema-missing',
      capabilityId: 'stat-modifier',
      note: 'Future movement-modifier may group speed changes more usefully',
    },
    [gap('dynamic-target-count', 'Slot +1 target per level above 1')],
  ),
  'mage-armor': blockedProseOnly({ code: 'effect-schema-missing', capabilityId: 'stat-modifier' }, [
    gap('object-state-awareness', 'Target must not be wearing armor'),
    gap('conditional-effect-model-missing', 'Spell ends early if target dons armor'),
  ]),
  'mage-hand': blockedProseOnly({ code: 'effect-schema-missing' }, [
    gap('object-state-awareness', 'Weight limit and object manipulation eligibility stay prose'),
    gap(
      'conditional-effect-model-missing',
      'Distance vanish, recast ends, and no attack or magic-item activation stay prose',
    ),
  ]),
  'magic-jar': reviewedProseOnly(),
  'mass-suggestion': reviewedProseOnly(),
  mending: blockedProseOnly({ code: 'effect-schema-missing' }, [
    gap('object-state-awareness', 'Break size limit and magic-item repair bounds stay prose'),
  ]),
  message: blockedProseOnly({ code: 'effect-schema-missing' }, [
    gap(
      'conditional-effect-model-missing',
      'Barrier, silence, and familiar-target routing stay prose',
    ),
  ]),
  'minor-illusion': blockedProseOnly({ code: 'effect-schema-missing', capabilityId: 'illusion' }, [
    gap('multi-mode-choice', 'Sound vs image mode stays prose'),
  ]),
  'misty-step': blockedProseOnly({ code: 'effect-schema-missing', capabilityId: 'movement' }),
  'pass-without-trace': blockedProseOnly(
    { code: 'effect-schema-missing', capabilityId: 'stat-modifier' },
    [gap('chosen-within-area', 'Allies chosen within aura stay prose')],
  ),
  'planar-binding': blockedProseOnly({ code: 'summoning-model-missing' }, [
    gap('effect-schema-missing', 'Service binding mechanics stay prose'),
    gap('conditional-effect-model-missing', 'Save, hostile twist, extend summon stay prose'),
    gap('progression-schema-missing', 'Slot duration scaling stays prose'),
  ]),
  polymorph: blockedProseOnly({ code: 'transformation-model-missing' }, [
    gap('choice-model-missing', 'Beast form choice stays prose'),
    gap('conditional-effect-model-missing', 'Save, THP tracking, early end stay prose'),
  ]),
  'power-word-heal': reviewedProseOnly(),
  prestidigitation: blockedProseOnly({ code: 'effect-schema-missing' }, [
    gap('multi-mode-choice', 'Sensory, fire, clean, mark, and creation modes stay prose'),
    gap('concurrent-effect-limit', 'Up to three non-instantaneous effects active at once'),
  ]),
  'prismatic-wall': reviewedProseOnly(),
  'purify-food-and-drink': blockedProseOnly({ code: 'effect-schema-missing' }, [
    gap('object-state-awareness', 'Nonmagical food and drink in sphere'),
  ]),
  'ray-of-enfeeblement': blockedProseOnly(
    { code: 'effect-schema-missing', capabilityId: 'condition' },
    [
      gap(
        'conditional-effect-model-missing',
        'Save branches, repeating saves, and 1d8 penalty stay prose',
      ),
    ],
  ),
  reincarnate: blockedProseOnly(
    {
      code: 'resurrection-model-missing',
      note: 'Remediation order — transformation follows',
    },
    [
      gap('transformation-model-missing', 'Species and form change stay prose'),
      gap('catalog-data-incomplete', 'Species roll table placeholder in prose'),
      gap('choice-model-missing', 'Species outcome choice stays prose'),
    ],
  ),
  resistance: blockedProseOnly({ code: 'effect-schema-missing', capabilityId: 'stat-modifier' }, [
    gap('choice-model-missing', 'Chosen damage type stays prose'),
    gap('conditional-effect-model-missing', 'Once per turn benefit limit stays prose'),
  ]),
  revivify: blockedProseOnly({ code: 'resurrection-model-missing' }),
  sanctuary: blockedProseOnly({ code: 'targeting-model-missing' }, [
    gap(
      'conditional-effect-model-missing',
      'Ward ends when warded creature attacks or deals damage',
    ),
  ]),
  shield: blockedProseOnly({ code: 'effect-schema-missing', capabilityId: 'stat-modifier' }, [
    gap('reaction-trigger', 'Cast when hit by attack or targeted by Magic Missile'),
    gap('conditional-effect-model-missing', 'Magic Missile immunity rider stays prose'),
  ]),
  'shield-of-faith': blockedProseOnly({
    code: 'effect-schema-missing',
    capabilityId: 'stat-modifier',
  }),
  'silent-image': blockedProseOnly({ code: 'effect-schema-missing', capabilityId: 'illusion' }, [
    gap('moving-aura-origin', 'Image relocates with Magic action'),
  ]),
  simulacrum: reviewedProseOnly(),
  sleep: blockedProseOnly({ code: 'effect-schema-missing', capabilityId: 'condition' }, [
    gap('chosen-within-area', 'Caster picks creatures in sphere; each makes an independent save'),
    gap(
      'conditional-effect-model-missing',
      'Multi-stage save, damage wake, and shake action stay prose',
    ),
  ]),
  'spare-the-dying': blockedProseOnly(
    { code: 'effect-schema-missing', capabilityId: 'condition' },
    [
      gap('object-state-awareness', 'Target must have 0 HP and not be dead'),
      gap('progression-schema-missing', 'Cantrip range scaling at levels 5/11/17 stays prose'),
    ],
  ),
  'speak-with-animals': blockedProseOnly({ code: 'effect-schema-missing' }),
  'summon-dragon': blockedProseOnly({ code: 'summoning-model-missing' }, [
    gap('catalog-data-incomplete', 'Draconic Spirit table placeholder in prose'),
    gap('progression-schema-missing', 'Slot level for stat block stays prose'),
  ]),
  symbol: reviewedProseOnly(),
  telekinesis: blockedProseOnly({ code: 'effect-schema-missing', capabilityId: 'movement' }, [
    gap('multi-mode-choice', 'Creature vs object branch stays prose'),
    gap('conditional-effect-model-missing', 'Saves, Restrained, suspended fall stay prose'),
    gap('object-state-awareness', 'Worn or carried object stays prose'),
  ]),
  thaumaturgy: blockedProseOnly({ code: 'effect-schema-missing' }, [
    gap('multi-mode-choice', 'Altered eyes, voice, fire, hand, sound, and tremor modes stay prose'),
    gap('concurrent-effect-limit', 'Up to three one-minute effects active at once'),
    gap('conditional-effect-model-missing', 'Booming Voice Intimidation advantage stays prose'),
  ]),
  'true-polymorph': reviewedProseOnly(),
  'true-strike': blockedProseOnly({ code: 'effect-schema-missing' }, [
    gap('choice-model-missing', 'Radiant vs weapon damage type choice stays prose'),
    gap('object-state-awareness', 'Proficient weapon material component stays prose'),
    gap(
      'progression-schema-missing',
      'Cantrip extra radiant scaling at levels 5/11/17 stays prose',
    ),
    gap(
      'weapon-attack-modification-model-missing',
      'Spellcasting ability drives weapon attack and damage rolls',
    ),
  ]),
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
