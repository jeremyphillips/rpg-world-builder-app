import {
  resolveClassAbilityScoreOrder,
  type AbilityScoreOrder,
  type CharacterClass,
  type CreateClassInput,
} from '@rpg/contracts'

import {
  contentFormRegistry,
  contentFormFields,
  type ContentFormDef,
} from '../../lib/forms/registry/content-form-registry'
import { finalizeContentInput } from '../../lib/forms/registry/content-form-key-helpers'
import { nameField } from '../../lib/forms/fields/content-identity-form-fields'
import { classesQueryKey, useClasses } from '../hooks/use-classes'
import {
  buildClassTabs,
  classDraftFormSchema,
  classFormSchema,
  createClassDraftFormSchema,
  createClassFormSchema,
  maxLevelFromCtx,
  type ClassFormValues,
} from './class-form-fields'
import {
  buildClassCreateInput,
  classCreateDefaultValues,
  proficienciesToFormValues,
  resourceToFormRow,
  spellcastingToFormValues,
} from './class-form-values'
import { featureToFormRow } from './class-feature-form-fields'
import { startingEquipmentToFormValues } from './character-creation/class-starting-equipment-form-values'
import { characterCreationProficienciesToFormValues } from './character-creation/class-character-creation-proficiencies-form-values'

function characterCreationToFormValues(
  entity: CharacterClass,
): ClassFormValues['characterCreation'] {
  const primaryAbilities = entity.primaryAbilities?.length
    ? entity.primaryAbilities
    : classCreateDefaultValues.primaryAbilities!

  return {
    proficiencies: characterCreationProficienciesToFormValues(entity.characterCreation),
    abilityScoreOrder: entity.characterCreation?.abilityScoreOrder
      ? ([...entity.characterCreation.abilityScoreOrder] as AbilityScoreOrder)
      : resolveClassAbilityScoreOrder({ primaryAbilities }),
    ...(entity.characterCreation?.startingEquipment
      ? {
          startingEquipment: startingEquipmentToFormValues(
            entity.characterCreation.startingEquipment,
          ),
        }
      : {}),
  }
}

const classFormDef: ContentFormDef<CharacterClass, ClassFormValues, CreateClassInput> = {
  routeKey: 'classes',

  schema: classFormSchema,
  draftSchema: classDraftFormSchema,
  resolveSchema: (ctx, intent = 'publish') =>
    intent === 'draft'
      ? createClassDraftFormSchema(maxLevelFromCtx(ctx), ctx)
      : createClassFormSchema(maxLevelFromCtx(ctx), ctx),
  createDefaultValues: classCreateDefaultValues,
  nameField,

  buildTabs: buildClassTabs,
  buildFields: (ctx) => contentFormFields(classFormDef, ctx),

  toFormValues: (entity) => ({
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    primaryAbilities: entity.primaryAbilities ?? classCreateDefaultValues.primaryAbilities!,
    hitDie: entity.hitDie ?? classCreateDefaultValues.hitDie!,
    hasSpellcasting: entity.spellcasting !== undefined,
    weaponProficiencyMode:
      entity.proficiencies && (entity.proficiencies.weapons.items?.length ?? 0) > 0
        ? 'individual'
        : 'categories',
    spellcasting: spellcastingToFormValues(entity.spellcasting),
    proficiencies: entity.proficiencies
      ? proficienciesToFormValues(entity.proficiencies)
      : classCreateDefaultValues.proficiencies!,
    features: entity.features.map(featureToFormRow),
    resources: entity.resources?.map(resourceToFormRow) ?? [],
    characterCreation: characterCreationToFormValues(entity),
  }),

  toInput: (values, ctx, validationIntent = 'publish') =>
    finalizeContentInput(
      buildClassCreateInput(values, ctx, validationIntent),
      ctx,
    ) as CreateClassInput,

  useListQuery: useClasses,
  queryKey: classesQueryKey,

  extractEmbeddedSeedRowIds: (entity) => ({
    features: entity.features.map((feature) => feature.id),
    'characterCreation.startingEquipment.options':
      entity.characterCreation?.startingEquipment?.options.map((option) => option.id) ?? [],
  }),
}

contentFormRegistry['classes'] = classFormDef

export { classFormDef, createClassFormSchema, createClassDraftFormSchema, classDraftFormSchema }
export type { ClassFormValues }
