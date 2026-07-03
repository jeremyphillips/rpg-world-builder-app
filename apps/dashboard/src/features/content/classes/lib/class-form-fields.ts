import { z } from 'zod'
import { createElement } from 'react'
import {
  campaignLevelSchema,
  MAX_CHARACTER_LEVEL,
  abilitySchema,
  hitDieSchema,
  slugSchema,
} from '@rpg/contracts'
import { type TabbedFormTab } from '@rpg/ui/form'

import { effectiveMaxFromCtx } from '../../lib/form-options/content-campaign-rules'
import { identityFields } from '../../lib/forms/fields/content-identity-form-fields'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { ClassFeaturesTab } from '../components/class-features-tab.client'
import { ClassCharacterCreationTab } from '../components/class-character-creation-tab.client'
import { ClassSubclassesTab } from '../components/class-subclasses-tab.client'
import { coreAttributesFields } from './class-basics-form-fields'
import { createFeatureRowFormSchema } from './class-feature-form-fields'
import { SUBCLASS_CHOICE_LEVEL_NONE, WEAPON_PROFICIENCY_MODES } from './class-form-constants'
import { proficienciesFields, proficienciesFormSchema } from './class-proficiencies-form-fields'
import { resourcesArrayField } from './class-resources-form-fields'
import { createSpellcastingFormSchema, spellcastingFields } from './class-spellcasting-form-fields'
import { startingEquipmentFormSchema } from './character-creation/class-starting-equipment-form-fields'

function campaignLevelField(maxLevel: number) {
  return z.coerce.number().pipe(campaignLevelSchema(maxLevel))
}

export function maxLevelFromCtx(ctx: ContentFormCtx): number {
  return effectiveMaxFromCtx(ctx)
}

export function createClassFormSchema(maxLevel: number = MAX_CHARACTER_LEVEL) {
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
    subclassChoiceLevel: z.union([z.literal(SUBCLASS_CHOICE_LEVEL_NONE), z.string()]),
    hasSpellcasting: z.boolean(),
    weaponProficiencyMode: z.enum(WEAPON_PROFICIENCY_MODES),
    spellcasting: createSpellcastingFormSchema(maxLevel).optional(),
    proficiencies: proficienciesFormSchema,
    features: z.array(createFeatureRowFormSchema(maxLevel)),
    resources: z.array(resourceRowFormSchema).optional(),
    characterCreation: z
      .object({
        startingEquipment: startingEquipmentFormSchema.optional(),
      })
      .optional(),
  })
}

export const classFormSchema = createClassFormSchema()

export type ClassFormValues = z.infer<typeof classFormSchema>

export function buildClassTabs(ctx: ContentFormCtx): TabbedFormTab[] {
  return [
    {
      id: 'basics',
      label: 'Basics',
      fields: [...identityFields(ctx), ...coreAttributesFields(ctx)],
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
      header: createElement(ClassFeaturesTab, { formCtx: ctx }),
    },
    {
      id: 'subclasses',
      label: 'Subclasses',
      fields: [],
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
      header: createElement(ClassCharacterCreationTab, { formCtx: ctx }),
    },
  ]
}
