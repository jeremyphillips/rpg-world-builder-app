import {
  type AbilityScoreRequirements,
  type ArmorEquipment,
  type CreateEquipmentInput,
} from '@rpg/contracts'

import {
  equipmentInputBase,
  parseEquipmentCreateInput,
  type EquipmentInputBuildCtx,
} from '../../lib/equipment-form-values-base'
import type { ArmorEquipmentFormValues } from '../../lib/equipment-form-fields'

type ArmorInput = Extract<CreateEquipmentInput, { kind: 'armor' }>

function optionalArmorAc(values: EquipmentInputBuildCtx<'armor'>['values']): Partial<ArmorInput> {
  if (values.armorCategory === 'shields') {
    return values.acBonus !== undefined ? { acBonus: values.acBonus } : {}
  }
  return values.baseAc !== undefined ? { baseAc: values.baseAc } : {}
}

/**
 * Strength is switch-gated in the form; other abilities on the item pass through
 * untouched. Returns `undefined` when no minimum remains.
 */
function abilityScoreRequirementsFromForm(
  values: Pick<
    ArmorEquipmentFormValues,
    'abilityScoreRequirements' | 'hasMinimumStrengthRequirement'
  >,
): AbilityScoreRequirements | undefined {
  const { str, ...otherAbilities } = values.abilityScoreRequirements ?? {}
  const requirements: AbilityScoreRequirements = {}
  for (const [ability, score] of Object.entries(otherAbilities)) {
    if (score !== undefined) requirements[ability as keyof AbilityScoreRequirements] = score
  }
  if (values.hasMinimumStrengthRequirement === true && str !== undefined) requirements.str = str
  return Object.keys(requirements).length > 0 ? requirements : undefined
}

export function armorFormValuesFromEntity(
  item: ArmorEquipment,
): Pick<
  ArmorEquipmentFormValues,
  | 'armorCategory'
  | 'material'
  | 'baseAc'
  | 'acBonus'
  | 'addDexModifier'
  | 'maxDexBonus'
  | 'stealthDisadvantage'
  | 'abilityScoreRequirements'
  | 'hasMinimumStrengthRequirement'
> {
  return {
    armorCategory: item.category,
    material: item.material,
    baseAc: item.baseAc,
    acBonus: item.acBonus,
    addDexModifier: item.addDexModifier,
    maxDexBonus: item.maxDexBonus,
    stealthDisadvantage: item.stealthDisadvantage,
    abilityScoreRequirements: item.abilityScoreRequirements,
    hasMinimumStrengthRequirement: item.abilityScoreRequirements?.str !== undefined,
  }
}

/** Maps armor form values to a create/update API input fragment. */
export function buildArmorInput({
  values,
  ctx,
  weight,
  validationIntent = 'publish',
}: EquipmentInputBuildCtx<'armor'>): CreateEquipmentInput {
  const isDraft = validationIntent === 'draft'
  const abilityScoreRequirements = abilityScoreRequirementsFromForm(values)

  return parseEquipmentCreateInput(
    {
      ...equipmentInputBase(values, ctx, validationIntent),
      kind: 'armor',
      ...(values.armorCategory && { category: values.armorCategory }),
      ...(isDraft
        ? {
            ...(values.addDexModifier !== undefined && { addDexModifier: values.addDexModifier }),
            ...(values.stealthDisadvantage !== undefined && {
              stealthDisadvantage: values.stealthDisadvantage,
            }),
          }
        : {
            addDexModifier: values.addDexModifier ?? false,
            stealthDisadvantage: values.stealthDisadvantage ?? false,
          }),
      ...(weight && { weight }),
      ...(values.material && { material: values.material }),
      ...optionalArmorAc(values),
      ...(values.maxDexBonus !== undefined && { maxDexBonus: values.maxDexBonus }),
      ...(abilityScoreRequirements && { abilityScoreRequirements }),
    },
    validationIntent,
  )
}
