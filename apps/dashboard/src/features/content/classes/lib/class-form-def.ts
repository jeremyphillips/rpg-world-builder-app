import { MAX_CHARACTER_LEVEL, type CharacterClass, type CreateClassInput } from '@rpg/contracts'

import {
  contentFormRegistry,
  contentFormFields,
  type ContentFormDef,
} from '../../lib/forms/content-form-registry'
import { finalizeContentInput } from '../../lib/forms/content-form-key-helpers'
import { skillProficienciesQueryKey } from '../../skillProficiencies/hooks/use-skill-proficiencies'
import { classesQueryKey, useClasses } from '../hooks/use-classes'
import { deriveAsiLevels } from './class-asi-features'
import { SUBCLASS_CHOICE_LEVEL_NONE } from './class-form-constants'
import {
  buildClassTabs,
  classFormSchema,
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

const classFormDef: ContentFormDef<CharacterClass, ClassFormValues, CreateClassInput> = {
  routeKey: 'classes',

  schema: classFormSchema,
  resolveSchema: (ctx) => createClassFormSchema(maxLevelFromCtx(ctx)),
  createDefaultValues: classCreateDefaultValues,

  buildTabs: buildClassTabs,
  buildFields: (ctx) => contentFormFields(classFormDef, ctx),

  toFormValues: (entity) => ({
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    primaryAbilities: entity.primaryAbilities,
    hitDie: entity.hitDie,
    asiLevels: deriveAsiLevels(entity.features),
    subclassChoiceLevel:
      entity.subclassChoiceLevel !== undefined
        ? String(entity.subclassChoiceLevel)
        : SUBCLASS_CHOICE_LEVEL_NONE,
    hasSpellcasting: entity.spellcasting !== undefined,
    weaponProficiencyMode:
      (entity.proficiencies.weapons.items?.length ?? 0) > 0 ? 'individual' : 'categories',
    spellcasting: spellcastingToFormValues(entity.spellcasting),
    proficiencies: proficienciesToFormValues(entity.proficiencies),
    features: entity.features.map(featureToFormRow),
    resources: entity.resources?.map(resourceToFormRow) ?? [],
    characterCreation: entity.characterCreation?.startingEquipment
      ? {
          startingEquipment: startingEquipmentToFormValues(
            entity.characterCreation.startingEquipment,
          ),
        }
      : undefined,
  }),

  toInput: (values, ctx) =>
    finalizeContentInput(
      buildClassCreateInput(
        values,
        ctx,
        ctx?.campaignRules?.maxCharacterLevel ?? MAX_CHARACTER_LEVEL,
      ),
      ctx,
    ) as CreateClassInput,

  useListQuery: useClasses,
  queryKey: classesQueryKey,
  invalidateQueryKeys: (campaignId) => [skillProficienciesQueryKey(campaignId)],

  extractEmbeddedSeedRowIds: (entity) => ({
    features: entity.features.map((feature) => feature.id),
    'characterCreation.startingEquipment.options':
      entity.characterCreation?.startingEquipment?.options.map((option) => option.id) ?? [],
  }),
}

contentFormRegistry['classes'] = classFormDef

export { classFormDef, createClassFormSchema }
export type { ClassFormValues }
export { SUBCLASS_CHOICE_LEVEL_NONE } from './class-form-constants'
