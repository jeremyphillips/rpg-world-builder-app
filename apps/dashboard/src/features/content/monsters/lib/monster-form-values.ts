import {
  armorClassFromProtection,
  creatureFormsDraftSchema,
  neutralAbilityScores,
  type ArmorClassRules,
  type ContentValidationIntent,
  type CreateMonsterInput,
  type CreatureFormsDraft,
  type CreatureWeaponProficiencies,
  type Monster,
  type MonsterActionDraft,
  type MonsterBonusActionDraft,
  type MonsterLegendaryActionDraft,
  type MonsterReactionDraft,
} from '@rpg/contracts'
import type { DiceFormulaValue } from '@rpg/ui'
import type { FieldValues } from 'react-hook-form'

import {
  hitPointsDiceAuthoringFields,
  hitPointsDiceFromFormValues,
  MONSTER_HIT_POINTS_DICE_COUNT_FIELD,
  MONSTER_HIT_POINTS_FIXED_AVERAGE_FIELD,
  MONSTER_HIT_POINTS_STASH_FIELD,
  MONSTER_HIT_POINTS_USE_FIXED_FIELD,
} from './statistics/monster-hit-points-form.lib'
import type { MONSTER_HIT_POINTS_DICE_FIELD } from './statistics/monster-hit-points-form.lib'
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
import { hydrateOnHitInActionList } from '../../lib/forms/mechanics/hydrate-effect-end-authoring'
import { mapWeaponActionDamageToForm } from './actions/weapon/monster-weapon-damage-form'
import {
  withDefaultSaveResolutionTarget,
  withSaveOutcomeSlots,
} from './actions/save/monster-save-resolution-target.lib'
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
  MONSTER_DEFAULT_WEAPON_PROFICIENCY_MODE,
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
  sizes?: Monster['sizes']
  creatureType?: Monster['creatureType']
  creatureFamilyIds?: Monster['creatureFamilyIds']
  classIds?: Monster['classIds']
  alignment?: Monster['alignment']
  abilityScores: Monster['abilityScores']
  armorClass: {
    naturalArmorBonus: number
    useFixedAc: boolean
    fixedValue?: number
  }
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
  forms?: CreatureFormsDraft
  /** Action rows mirror Zod draft schemas; save normalization parses to publish shape. */
  actions: MonsterActionDraft[]
  bonusActions: MonsterBonusActionDraft[]
  reactions: MonsterReactionDraft[]
  legendaryActions?: {
    uses?: number
    usesInLair?: number
    actions: MonsterLegendaryActionDraft[]
  }
  [MONSTER_HIT_POINTS_USE_FIXED_FIELD]?: boolean
  [MONSTER_HIT_POINTS_DICE_FIELD]?: DiceFormulaValue
  [MONSTER_HIT_POINTS_STASH_FIELD]?: MonsterHitPointStash
  [MONSTER_HIT_POINTS_FIXED_AVERAGE_FIELD]?: number
  weaponProficiencyMode?: WeaponProficiencyMode
  weaponProficiencyReconciliationPending?: boolean
}

export function resolveMonsterCreateDefaultValues(): MonsterFormValues {
  return {
    name: '',
    sizes: [],
    abilityScores: neutralAbilityScores(),
    armorClass: { naturalArmorBonus: 0, useFixedAc: false },
    hitPoints: { kind: 'hit-dice', count: 1 },
    [MONSTER_HIT_POINTS_USE_FIXED_FIELD]: false,
    [MONSTER_HIT_POINTS_DICE_COUNT_FIELD]: 1,
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
    weaponProficiencyMode: MONSTER_DEFAULT_WEAPON_PROFICIENCY_MODE,
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
    sizes: entity.sizes,
  })
  return {
    [MONSTER_HIT_POINTS_USE_FIXED_FIELD]: useFixed,
    ...(dice
      ? hitPointsDiceAuthoringFields(dice)
      : {
          [MONSTER_HIT_POINTS_DICE_COUNT_FIELD]:
            entity.hitPoints.kind === 'hit-dice' ? entity.hitPoints.count : 1,
        }),
    [MONSTER_HIT_POINTS_STASH_FIELD]: {},
    ...(useFixed && entity.hitPoints.kind === 'fixed' && entity.hitPoints.average !== undefined
      ? { [MONSTER_HIT_POINTS_FIXED_AVERAGE_FIELD]: entity.hitPoints.average }
      : {}),
  }
}

function armorClassFormValue(entity: Monster, rules?: ArmorClassRules) {
  return {
    naturalArmorBonus: entity.armorClass.naturalArmorBonus ?? 0,
    useFixedAc: entity.armorClass.fixedAcOffset !== undefined,
    ...(entity.armorClass.fixedAcOffset !== undefined && rules
      ? { fixedValue: armorClassFromProtection(rules, entity.armorClass.fixedAcOffset) }
      : {}),
  }
}

function actionListFormValues<
  T extends MonsterActionDraft | MonsterBonusActionDraft | MonsterReactionDraft,
>(actions: T[]): T[] {
  return hydrateOnHitInActionList(
    actions
      .map(mapWeaponActionDamageToForm)
      .map((action) => withSaveOutcomeSlots(withDefaultSaveResolutionTarget(action))),
  ) as T[]
}

function legendaryActionFormValues(entity: Monster) {
  if (!entity.legendaryActions) return {}
  return {
    legendaryActions: {
      uses: entity.legendaryActions.uses,
      ...(entity.legendaryActions.usesInLair !== undefined
        ? { usesInLair: entity.legendaryActions.usesInLair }
        : {}),
      actions: hydrateOnHitInActionList(
        entity.legendaryActions.actions
          .map(mapWeaponActionDamageToForm)
          .map((action) => withSaveOutcomeSlots(withDefaultSaveResolutionTarget(action))),
      ),
    },
  }
}

export function monsterToFormValues(
  entity: Monster,
  ctx?: { armorClassRules?: ArmorClassRules },
): MonsterFormValues {
  const weapons = coerceCreatureWeaponProficienciesForForm(entity.proficiencies.weapons)
  const parsedForms = entity.forms ? creatureFormsDraftSchema.safeParse(entity.forms) : undefined

  return {
    name: entity.name,
    description: entity.description,
    sizes: entity.sizes,
    creatureType: entity.creatureType,
    creatureFamilyIds: entity.creatureFamilyIds,
    classIds: entity.classIds,
    alignment: entity.alignment,
    abilityScores: entity.abilityScores,
    armorClass: armorClassFormValue(entity, ctx?.armorClassRules),
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
    ...(parsedForms?.success
      ? {
          forms: {
            ...parsedForms.data,
            definedForms: parsedForms.data.definedForms.map((form) => ({
              ...form,
              speechRestricted: form.overrides?.canSpeak === false,
              ...(form.overrides?.movement
                ? {
                    movementOverride: {
                      rows: movementRecordToRows(form.overrides.movement.speeds),
                      ...(form.overrides.movement.hover ? { hover: true as const } : {}),
                    },
                  }
                : {}),
            })),
          },
        }
      : {}),
    actions: actionListFormValues(entity.actions),
    bonusActions: actionListFormValues(entity.bonusActions),
    reactions: actionListFormValues(entity.reactions),
    ...legendaryActionFormValues(entity),
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
    creatureFamilyIds: entity.creatureFamilyIds,
    classIds: entity.classIds,
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
    armorClassRules: ctx?.armorClassRules,
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
