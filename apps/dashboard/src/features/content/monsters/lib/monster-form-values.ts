import type {
  ContentValidationIntent,
  CreateMonsterInput,
  CreatureWeaponProficiencies,
  Monster,
  MonsterAction,
  MonsterReaction,
} from '@rpg/contracts'
import type { DiceFormulaValue } from '@rpg/ui'
import type { FieldValues } from 'react-hook-form'

import {
  defaultHitPointsDiceForSize,
  MONSTER_HIT_POINTS_DICE_FIELD,
  MONSTER_HIT_POINTS_FIXED_AVERAGE_FIELD,
  MONSTER_HIT_POINTS_STASH_FIELD,
  MONSTER_HIT_POINTS_USE_FIXED_FIELD,
  hitPointsDiceFromFormValues,
} from './statistics/monster-hit-points-form.lib'
import type { MonsterHitPointStash } from './statistics/monster-variant-transitions'

import type { WeaponProficiencyMode } from '../../classes/lib/class-form-constants'
import type { ContentFormInputCtx } from '../../lib/forms/registry/content-form-registry'
import {
  movementRecordToRows,
  type MovementRowDraftFormValues,
} from '../../lib/forms/fields/content-movement-form-fields'
import {
  finalizeContentInput,
  slugForInputParse,
} from '../../lib/forms/registry/content-form-key-helpers'
import {
  normalizeMonsterFormValues,
  type MonsterNormalizeBaseline,
} from './normalize-monster-form-values'
import {
  EMPTY_CREATURE_WEAPON_PROFICIENCIES,
  createMonsterDraftInputSchema,
  createMonsterInputSchema,
  updateMonsterDraftInputSchema,
  updateMonsterInputSchema,
} from '@rpg/contracts'

import {
  coerceCreatureWeaponProficienciesForForm,
  weaponProficiencyHydrationFromWeapons,
} from './creature-details/monster-weapon-proficiencies-form.lib'

/** Form state uses a weapon grant set; save normalizes to persisted target rows. */
export type MonsterFormProficiencies = Omit<Monster['proficiencies'], 'weapons'> & {
  weapons: CreatureWeaponProficiencies
}

export type MonsterEquipmentFormEntry = Monster['equipment'][number]

export type MonsterFormValues = FieldValues & {
  name: string
  description?: string
  size?: Monster['size']
  creatureType?: Monster['creatureType']
  alignment?: Monster['alignment']
  abilityScores: Monster['abilityScores']
  armorClass:
    | Monster['armorClass']
    | { kind: 'fixed'; value?: number }
    | { kind: 'natural'; bonus?: number }
  hitPoints: Monster['hitPoints'] | { kind: 'fixed'; average?: number; formula?: string }
  movement: MovementRowDraftFormValues[]
  hover?: boolean
  senses: Array<{ type: Monster['senses'][number]['type']; range?: number }>
  communication: Monster['communication']
  challengeRating?: Monster['challengeRating']
  experiencePointsOverride?: number
  proficiencies: MonsterFormProficiencies
  defenses: Monster['defenses']
  equipment: MonsterEquipmentFormEntry[]
  traits: Monster['traits']
  actions: Array<MonsterAction | Record<string, unknown>>
  bonusActions: Array<MonsterAction | Record<string, unknown>>
  reactions: Array<MonsterReaction | Record<string, unknown>>
  [MONSTER_HIT_POINTS_USE_FIXED_FIELD]?: boolean
  [MONSTER_HIT_POINTS_DICE_FIELD]?: DiceFormulaValue
  [MONSTER_HIT_POINTS_STASH_FIELD]?: MonsterHitPointStash
  [MONSTER_HIT_POINTS_FIXED_AVERAGE_FIELD]?: number
  weaponProficiencyMode?: WeaponProficiencyMode
  weaponProficiencyReconciliationPending?: boolean
}

const NEUTRAL_ABILITIES: Monster['abilityScores'] = {
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
}

export function resolveMonsterCreateDefaultValues(): MonsterFormValues {
  return {
    name: '',
    size: 'medium',
    alignment: 'unaligned',
    abilityScores: { ...NEUTRAL_ABILITIES },
    armorClass: { kind: 'unarmored' },
    hitPoints: { kind: 'hit-dice', count: 1 },
    [MONSTER_HIT_POINTS_USE_FIXED_FIELD]: false,
    [MONSTER_HIT_POINTS_DICE_FIELD]: defaultHitPointsDiceForSize('medium'),
    [MONSTER_HIT_POINTS_STASH_FIELD]: {},
    movement: [{ mode: 'walk', feet: 30 }],
    senses: [],
    communication: {},
    proficiencies: {
      savingThrows: [],
      skills: [],
      languages: [],
      weapons: { ...EMPTY_CREATURE_WEAPON_PROFICIENCIES },
    },
    defenses: {
      vulnerabilities: [],
      resistances: [],
      immunities: [],
      conditionImmunities: [],
    },
    equipment: [],
    traits: [],
    actions: [],
    bonusActions: [],
    reactions: [],
    weaponProficiencyMode: 'none',
    weaponProficiencyReconciliationPending: false,
  }
}

function hitPointsAuthoringFromEntity(
  entity: Monster,
): Pick<
  MonsterFormValues,
  | typeof MONSTER_HIT_POINTS_USE_FIXED_FIELD
  | typeof MONSTER_HIT_POINTS_DICE_FIELD
  | typeof MONSTER_HIT_POINTS_STASH_FIELD
  | typeof MONSTER_HIT_POINTS_FIXED_AVERAGE_FIELD
> {
  const useFixed = entity.hitPoints.kind === 'fixed'
  const dice = hitPointsDiceFromFormValues({
    hitPoints: entity.hitPoints,
    size: entity.size,
  })
  return {
    [MONSTER_HIT_POINTS_USE_FIXED_FIELD]: useFixed,
    [MONSTER_HIT_POINTS_DICE_FIELD]: dice,
    [MONSTER_HIT_POINTS_STASH_FIELD]: {},
    ...(useFixed && entity.hitPoints.kind === 'fixed' && entity.hitPoints.average !== undefined
      ? { [MONSTER_HIT_POINTS_FIXED_AVERAGE_FIELD]: entity.hitPoints.average }
      : {}),
  }
}

export function monsterToFormValues(entity: Monster): MonsterFormValues {
  const weapons = coerceCreatureWeaponProficienciesForForm(entity.proficiencies.weapons)

  return {
    name: entity.name,
    description: entity.description,
    size: entity.size,
    creatureType: entity.creatureType,
    alignment: entity.alignment,
    abilityScores: entity.abilityScores,
    armorClass: entity.armorClass,
    hitPoints: entity.hitPoints,
    ...hitPointsAuthoringFromEntity(entity),
    movement: movementRecordToRows(entity.movement),
    hover: entity.hover,
    senses: entity.senses ?? [],
    communication: entity.communication ?? {},
    challengeRating: entity.challengeRating,
    experiencePointsOverride: entity.experiencePointsOverride,
    proficiencies: {
      ...entity.proficiencies,
      weapons,
    },
    defenses: entity.defenses,
    equipment: entity.equipment,
    traits: entity.traits,
    actions: entity.actions,
    bonusActions: entity.bonusActions,
    reactions: entity.reactions,
    ...(() => {
      const hydration = weaponProficiencyHydrationFromWeapons(weapons)
      return {
        weaponProficiencyMode: hydration.mode,
        weaponProficiencyReconciliationPending: hydration.reconciliationPending,
      }
    })(),
  }
}

function baselineFromEntity(entity: Monster | undefined): MonsterNormalizeBaseline | undefined {
  if (!entity) return undefined
  return {
    hover: entity.hover,
    description: entity.description,
    experiencePointsOverride: entity.experiencePointsOverride,
  }
}

export function buildMonsterInput(
  values: MonsterFormValues,
  ctx: ContentFormInputCtx<Monster> | undefined,
  validationIntent: ContentValidationIntent,
): CreateMonsterInput {
  const normalized = normalizeMonsterFormValues(values, {
    baseline: baselineFromEntity(ctx?.entity),
    intent: validationIntent,
    mode: ctx?.entity ? 'update' : 'create',
  })
  const slug = slugForInputParse(
    typeof normalized.name === 'string' ? normalized.name : values.name,
    ctx,
  )
  const payload = { ...normalized, slug }
  const schema = ctx?.entity
    ? validationIntent === 'draft'
      ? updateMonsterDraftInputSchema
      : updateMonsterInputSchema
    : validationIntent === 'draft'
      ? createMonsterDraftInputSchema
      : createMonsterInputSchema
  return finalizeContentInput(schema.parse(payload), ctx) as CreateMonsterInput
}
