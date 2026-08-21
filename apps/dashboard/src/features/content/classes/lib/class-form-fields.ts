import { z } from 'zod'
import { createElement } from 'react'
import {
  campaignLevelSchema,
  MAX_CHARACTER_LEVEL,
  abilitySchema,
  abilityScoreOrderSchema,
  hitDieSchema,
  slugSchema,
} from '@rpg/contracts'
import { type TabbedFormTab } from '@rpg/ui/form'

import { effectiveMaxFromCtx } from '../../lib/form-options/content-campaign-rules'
import { descriptionField } from '../../lib/forms/fields/content-identity-form-fields'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { draftOptionalSelect } from '../../lib/forms/validation/draft-form-schema-helpers'
import {
  embeddedArrayResolverField,
  embeddedMasterDetailTabValidation,
} from '../../lib/forms/validation/tabbed-form-resolver-fields'
import { ClassFeaturesTab } from '../components/class-features-tab.client'
import { ClassCharacterCreationTab } from '../components/class-character-creation-tab.client'
import { ClassSubclassesTab } from '../components/class-subclasses-tab.client'
import { coreAttributesFields } from './class-basics-form-fields'
import {
  classFeatureItemFields,
  createFeatureRowDraftFormSchema,
  createFeatureRowFormSchema,
} from './class-feature-form-fields'
import { WEAPON_PROFICIENCY_MODES } from './class-form-constants'
import {
  proficienciesDraftFormSchema,
  proficienciesFields,
  proficienciesFormSchema,
} from './class-proficiencies-form-fields'
import { resourcesArrayField } from './class-resources-form-fields'
import { createSpellcastingFormSchema, spellcastingFields } from './class-spellcasting-form-fields'
import { startingEquipmentFormSchema } from './character-creation/class-starting-equipment-form-fields'
import { refineCharacterCreationSaveValidation } from './character-creation/class-character-creation-form-validation'
import {
  characterCreationProficienciesFormSchema,
  characterCreationSkillChoiceFields,
  characterCreationToolChoiceFields,
} from './character-creation/class-character-creation-proficiencies-form-fields'
import {
  STARTING_EQUIPMENT_OPTIONS_FIELD_NAME,
  startingEquipmentOptionItemFields,
} from './character-creation/class-starting-equipment-form-fields'

function campaignLevelField(maxLevel: number) {
  return z.coerce.number().pipe(campaignLevelSchema(maxLevel))
}

export function maxLevelFromCtx(ctx: ContentFormCtx): number {
  return effectiveMaxFromCtx(ctx)
}

export function createClassFormSchema(
  maxLevel: number = MAX_CHARACTER_LEVEL,
  formCtx?: Pick<ContentFormCtx, 'options' | 'entityId'>,
) {
  const levelField = campaignLevelField(maxLevel)
  const resourceEntryFormSchema = z.object({
    level: levelField,
    value: z.coerce.number().int().min(0),
  })
  const resourceRowFormSchema = z.object({
    name: z.string().min(1),
    entries: z.array(resourceEntryFormSchema).min(1),
  })

  return z.object({
    name: z.string().min(1),
    slug: slugSchema.optional(),
    description: z.string().optional(),
    primaryAbilities: z.array(abilitySchema).min(1).max(2),
    hitDie: z.coerce.number().pipe(hitDieSchema),
    hasSpellcasting: z.boolean(),
    weaponProficiencyMode: z.enum(WEAPON_PROFICIENCY_MODES),
    spellcasting: createSpellcastingFormSchema(maxLevel).optional(),
    proficiencies: proficienciesFormSchema,
    features: z.array(createFeatureRowFormSchema(maxLevel)),
    resources: z.array(resourceRowFormSchema).optional(),
    characterCreation: z
      .object({
        startingEquipment: startingEquipmentFormSchema.optional(),
        proficiencies: characterCreationProficienciesFormSchema.optional(),
        abilityScoreOrder: abilityScoreOrderSchema.optional(),
      })
      .optional()
      .superRefine((characterCreation, ctx) => {
        refineCharacterCreationSaveValidation(characterCreation, ctx, formCtx)
      }),
  })
}

export function createClassDraftFormSchema(
  maxLevel: number = MAX_CHARACTER_LEVEL,
  _formCtx?: Pick<ContentFormCtx, 'options' | 'entityId'>,
) {
  const levelField = campaignLevelField(maxLevel)
  const resourceEntryFormSchema = z.object({
    level: levelField,
    value: z.coerce.number().int().min(0),
  })
  const resourceRowDraftFormSchema = z.object({
    name: z.string(),
    entries: z.array(resourceEntryFormSchema).default([]),
  })

  return z.object({
    name: z.string(),
    slug: slugSchema.optional(),
    description: z.string().optional(),
    primaryAbilities: z.array(abilitySchema).max(2).default([]),
    hitDie: draftOptionalSelect(z.coerce.number().pipe(hitDieSchema)),
    hasSpellcasting: z.boolean(),
    weaponProficiencyMode: z.enum(WEAPON_PROFICIENCY_MODES),
    spellcasting: createSpellcastingFormSchema(maxLevel).optional(),
    proficiencies: proficienciesDraftFormSchema,
    features: z.array(createFeatureRowDraftFormSchema(maxLevel)).default([]),
    resources: z.array(resourceRowDraftFormSchema).optional(),
    characterCreation: z
      .object({
        startingEquipment: startingEquipmentFormSchema.optional(),
        proficiencies: characterCreationProficienciesFormSchema.optional(),
        abilityScoreOrder: abilityScoreOrderSchema.optional(),
      })
      .optional(),
  })
}

export const classFormSchema = createClassFormSchema()
export const classDraftFormSchema = createClassDraftFormSchema()

export type ClassFormValues = z.infer<typeof classFormSchema>

export function buildClassTabs(ctx: ContentFormCtx): TabbedFormTab[] {
  return [
    {
      id: 'basics',
      label: 'Basics',
      fields: [descriptionField(ctx), ...coreAttributesFields(ctx)],
    },
    {
      id: 'proficiencies',
      label: 'Proficiencies',
      fields: proficienciesFields(ctx),
    },
    {
      id: 'spellcasting',
      label: 'Spellcasting',
      fields: spellcastingFields(ctx),
    },
    {
      id: 'features',
      label: 'Features',
      fields: [resourcesArrayField(ctx)],
      ...embeddedMasterDetailTabValidation({
        path: 'features',
        legend: 'Features',
        fields: classFeatureItemFields(ctx),
      }),
      header: createElement(ClassFeaturesTab, { formCtx: ctx }),
    },
    {
      id: 'subclasses',
      label: 'Subclasses',
      fields: [],
      skipHeaderOnlyValidationWiring: true,
      header: createElement(ClassSubclassesTab, {
        campaignId: ctx.campaignId,
        classId: ctx.entityId,
        mode: ctx.mode,
        formCtx: ctx,
      }),
    },
    {
      id: 'characterCreation',
      label: 'Character creation',
      fields: [],
      errorPaths: ['characterCreation'],
      resolverFields: [
        embeddedArrayResolverField(
          STARTING_EQUIPMENT_OPTIONS_FIELD_NAME,
          'Starting equipment packages',
          startingEquipmentOptionItemFields(ctx),
        ),
        ...characterCreationSkillChoiceFields(ctx),
        ...characterCreationToolChoiceFields(ctx),
      ],
      header: createElement(ClassCharacterCreationTab, { formCtx: ctx }),
    },
  ]
}
