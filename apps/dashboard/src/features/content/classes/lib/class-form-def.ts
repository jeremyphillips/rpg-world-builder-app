import { type CharacterClass, type CreateClassInput } from '@rpg/contracts'

import {
  contentFormRegistry,
  contentFormFields,
  type ContentFormDef,
} from '../../lib/forms/content-form-registry'
import { finalizeContentInput } from '../../lib/forms/content-form-key-helpers'
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

const classFormDef: ContentFormDef<CharacterClass, ClassFormValues, CreateClassInput> = {
  routeKey: 'classes',

  schema: classFormSchema,
  draftSchema: classDraftFormSchema,
  resolveSchema: (ctx, intent = 'publish') =>
    intent === 'draft'
      ? createClassDraftFormSchema(maxLevelFromCtx(ctx), ctx)
      : createClassFormSchema(maxLevelFromCtx(ctx), ctx),
  createDefaultValues: classCreateDefaultValues,

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
    characterCreation: {
      proficiencies: characterCreationProficienciesToFormValues(entity.characterCreation),
      ...(entity.characterCreation?.startingEquipment
        ? {
            startingEquipment: startingEquipmentToFormValues(
              entity.characterCreation.startingEquipment,
            ),
          }
        : {}),
    },
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
