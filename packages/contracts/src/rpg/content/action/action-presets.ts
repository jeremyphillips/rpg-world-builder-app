import type { EffectResolution } from '../lib/resolution/schema'
import { effectResolutionSchema } from '../lib/resolution/schema'
import { RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID } from '../lib/resolution/schema'
import {
  ACTION_VOCABULARY_ENTRIES,
  type ActionVocabularyId,
} from '../../vocab/action/action-vocabulary'
import type { NaturalAttackForm } from '../../vocab/action/natural-attack-form'

const NATURAL_ATTACK_DAMAGE_TYPE = {
  bite: 'piercing',
  claw: 'slashing',
  slam: 'bludgeoning',
  gore: 'piercing',
  ram: 'bludgeoning',
  sting: 'piercing',
  tail: 'bludgeoning',
  talons: 'slashing',
  tentacle: 'bludgeoning',
  rend: 'slashing',
} as const

const DEFAULT_NATURAL_DAMAGE = { dice: { count: 1, faces: 6 } } as const

export const ACTION_PRESET_MECHANICS = ['attack-roll', 'saving-throw', 'sequence'] as const

export type ActionPresetMechanics = (typeof ACTION_PRESET_MECHANICS)[number]

type AttackRollPreset = {
  vocabularyId: ActionVocabularyId
  mechanics: 'attack-roll'
  defaults: {
    naturalForm: NaturalAttackForm
    damageType: string
    mode: 'melee'
    reach: 5
    damage: { dice: { count: 1; faces: 6 } }
  }
}

type SavingThrowPreset = {
  vocabularyId: ActionVocabularyId
  mechanics: 'saving-throw'
  rulesets?: readonly string[]
  defaults: {
    resolution: EffectResolution
    limitedUse?: { kind: 'recharge'; minRoll: number }
    suggestedName: string
  }
}

type SequencePreset = {
  vocabularyId: ActionVocabularyId
  mechanics: 'sequence'
  defaults: { steps: [] }
}

export type ActionPreset = AttackRollPreset | SavingThrowPreset | SequencePreset

function naturalAttackPreset(
  vocabularyId: keyof typeof NATURAL_ATTACK_DAMAGE_TYPE,
): AttackRollPreset {
  const entry = ACTION_VOCABULARY_ENTRIES[vocabularyId]
  if (!entry.naturalForm) {
    throw new Error(`Natural attack preset ${vocabularyId} is missing a form.`)
  }
  return {
    vocabularyId,
    mechanics: 'attack-roll',
    defaults: {
      naturalForm: entry.naturalForm,
      damageType: NATURAL_ATTACK_DAMAGE_TYPE[vocabularyId],
      mode: 'melee',
      reach: 5,
      damage: DEFAULT_NATURAL_DAMAGE,
    },
  }
}

const BREATH_WEAPON_RESOLUTION = effectResolutionSchema.parse({
  selectionMode: 'self',
  areaOfEffect: { shape: 'cone', length: { value: 15, unit: 'ft' } },
  method: { kind: 'saving-throw', ability: 'dex' },
  effects: [
    {
      id: RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
      kind: 'damage',
      roll: { dice: { count: 1, faces: 6 } },
      damageType: 'fire',
    },
  ],
  outcomes: [
    {
      result: 'failed-save',
      applications: [{ effectId: RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'full' }],
    },
    {
      result: 'successful-save',
      applications: [{ effectId: RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'half' }],
    },
  ],
})

const CONSTRICT_RESOLUTION = effectResolutionSchema.parse({
  selectionMode: 'targets',
  target: {
    count: 1,
    kind: 'creature',
    proximity: { kind: 'reach', distance: { value: 5, unit: 'ft' } },
  },
  method: { kind: 'saving-throw', ability: 'str' },
  effects: [
    {
      id: RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
      kind: 'damage',
      roll: { dice: { count: 1, faces: 6 } },
      damageType: 'bludgeoning',
    },
  ],
  outcomes: [
    {
      result: 'failed-save',
      applications: [{ effectId: RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'full' }],
      note: 'The target is Grappled (escape DC equals the save DC).',
    },
  ],
})

export const ACTION_PRESET_ENTRIES = {
  bite: naturalAttackPreset('bite'),
  claw: naturalAttackPreset('claw'),
  slam: naturalAttackPreset('slam'),
  gore: naturalAttackPreset('gore'),
  ram: naturalAttackPreset('ram'),
  sting: naturalAttackPreset('sting'),
  tail: naturalAttackPreset('tail'),
  talons: naturalAttackPreset('talons'),
  tentacle: naturalAttackPreset('tentacle'),
  rend: naturalAttackPreset('rend'),
  'breath-weapon': {
    vocabularyId: 'breath-weapon',
    mechanics: 'saving-throw',
    defaults: {
      resolution: BREATH_WEAPON_RESOLUTION,
      limitedUse: { kind: 'recharge', minRoll: 5 },
      suggestedName: 'Fire Breath',
    },
  },
  constrict: {
    vocabularyId: 'constrict',
    mechanics: 'saving-throw',
    rulesets: ['srd-cc-5.2.1'],
    defaults: {
      resolution: CONSTRICT_RESOLUTION,
      suggestedName: 'Constrict',
    },
  },
  multiattack: {
    vocabularyId: 'multiattack',
    mechanics: 'sequence',
    defaults: { steps: [] },
  },
} as const satisfies Record<string, ActionPreset>

export type ActionPresetId = keyof typeof ACTION_PRESET_ENTRIES

export const ACTION_PRESET_IDS = Object.keys(ACTION_PRESET_ENTRIES) as [
  ActionPresetId,
  ...ActionPresetId[],
]

export function getActionPreset(id: string): ActionPreset | undefined {
  return ACTION_PRESET_ENTRIES[id as ActionPresetId]
}
