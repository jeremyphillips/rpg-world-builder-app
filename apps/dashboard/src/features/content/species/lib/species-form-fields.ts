import { createElement } from 'react'
import { z } from 'zod'
import {
  CREATURE_SIZES,
  CREATURE_SIZE_ENTRIES,
  creatureSizeSchema,
  creatureTypeSchema,
  slugSchema,
  type CreatureTypeId,
} from '@rpg/contracts'
import { toOptions, type FormItem, type TabbedFormTab } from '@rpg/ui/form'

import { vocabularySelectField } from '@/features/homebrew'

import { getCharacterCreatureTypeFieldOptions } from '../../lib/form-options/creature-type-field-options'
import { feetInputUnitField, identityFields } from '../../lib/forms/content-identity-form-fields'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { SpeciesHeritageTab } from '../components/species-heritage-tab.client'
import { SpeciesRulesTab } from '../components/species-rules-tab.client'
import { SpeciesTraitsTab } from '../components/species-traits-tab.client'
import { heritageFormSchema } from './species-heritage-form-fields'
import { speciesCharacterCreationFormSchema } from './species-rules-form-fields'
import { refineSpeciesCharacterCreationForm } from './species-rules-form-values'
import { traitRowFormSchema } from './species-trait-form-fields'

const creatureSizeOptions = toOptions(
  CREATURE_SIZES,
  Object.fromEntries(CREATURE_SIZES.map((s) => [s, CREATURE_SIZE_ENTRIES[s].label])) as Record<
    (typeof CREATURE_SIZES)[number],
    string
  >,
)

export function createSpeciesFormSchema(
  allowedCreatureTypes: readonly CreatureTypeId[],
  activeCreatureTypes?: ReadonlySet<string>,
  formCtx: ContentFormCtx = {},
) {
  const allowedSet = new Set(allowedCreatureTypes)

  return z
    .object({
      name: z.string().min(1),
      slug: slugSchema.optional(),
      description: z.string().optional(),
      creatureType: creatureTypeSchema,
      sizes: z.array(creatureSizeSchema).min(1),
      speed: z.object({
        walk: z.coerce.number().int().min(0),
      }),
      traits: z.array(traitRowFormSchema),
      heritage: heritageFormSchema.optional(),
      characterCreation: speciesCharacterCreationFormSchema.optional(),
    })
    .superRefine((values, ctx) => {
      if (!allowedSet.has(values.creatureType)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Creature type is not allowed for character sheets in this campaign',
          path: ['creatureType'],
        })
      }
      if (activeCreatureTypes && !activeCreatureTypes.has(values.creatureType)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Creature type is not available in this campaign vocabulary',
          path: ['creatureType'],
        })
      }
      refineSpeciesCharacterCreationForm(values.characterCreation, formCtx, ctx)
    })
}

export const speciesFormSchema = createSpeciesFormSchema(['humanoid'])
export type SpeciesFormValues = z.infer<typeof speciesFormSchema>

function attributesFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      kind: 'row',
      fields: [
        vocabularySelectField({
          name: 'creatureType',
          label: 'Creature type',
          options: getCharacterCreatureTypeFieldOptions(ctx),
          required: true,
          width: 'lg',
        }),
        feetInputUnitField('speed.walk', 'Walk speed', {
          required: true,
          width: 'auto',
          defaultValue: 30,
        }),
      ],
    },
    {
      type: 'chips',
      name: 'sizes',
      label: 'Size',
      options: creatureSizeOptions,
      required: true,
    },
  ]
}

export function buildSpeciesTabs(ctx: ContentFormCtx): TabbedFormTab[] {
  return [
    {
      id: 'basics',
      label: 'Basics',
      fields: [...identityFields(ctx), ...attributesFields(ctx)],
    },
    {
      id: 'traits',
      label: 'Traits',
      fields: [],
      header: createElement(SpeciesTraitsTab, { formCtx: ctx }),
    },
    {
      id: 'heritage',
      label: 'Heritage',
      fields: [],
      header: createElement(SpeciesHeritageTab, { formCtx: ctx }),
    },
    {
      id: 'rules',
      label: 'Rules',
      fields: [],
      header: createElement(SpeciesRulesTab, { formCtx: ctx }),
    },
  ]
}
