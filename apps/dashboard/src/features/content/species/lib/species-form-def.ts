import { createElement } from 'react'
import { z } from 'zod'
import {
  CREATURE_SIZES,
  CREATURE_SIZE_ENTRIES,
  creatureSizeSchema,
  creatureTypeSchema,
  slugSchema,
  type CreateSpeciesInput,
  type CreatureType,
  type Species,
} from '@rpg/contracts'
import { toOptions, type FormItem, type TabbedFormTab } from '@rpg/ui/form'

import {
  allowedCharacterCreatureTypesFromCtx,
  getCharacterCreatureTypeFieldOptions,
} from '../../lib/creature-type-field-options'
import { identityFields, walkSpeedInlineCountField } from '../../lib/content-form-field-helpers'
import { envelopeSlugFields, finalizeContentInput } from '../../lib/content-form-key-helpers'
import {
  contentFormRegistry,
  contentFormFields,
  type ContentFormCtx,
  type ContentFormDef,
  type ContentFormInputCtx,
} from '../../lib/content-form-registry'
import { SpeciesHeritageTab } from '../components/species-heritage-tab.client'
import { SpeciesTraitsTab } from '../components/species-traits-tab.client'
import { useSpecies, speciesQueryKey } from '../hooks/use-species'
import {
  heritageFormSchema,
  heritageFromFormValues,
  heritageToFormRow,
} from './species-heritage-form-fields'
import {
  traitRowFormSchema,
  traitToFormRow,
  traitsFromFormValues,
} from './species-trait-form-fields'

// ---------------------------------------------------------------------------
// Vocab option lists
// ---------------------------------------------------------------------------

const creatureSizeOptions = toOptions(
  CREATURE_SIZES,
  Object.fromEntries(CREATURE_SIZES.map((s) => [s, CREATURE_SIZE_ENTRIES[s].label])) as Record<
    (typeof CREATURE_SIZES)[number],
    string
  >,
)

// ---------------------------------------------------------------------------
// Form schema
// ---------------------------------------------------------------------------

function createSpeciesFormSchema(allowedCreatureTypes: readonly CreatureType[]) {
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
    })
    .superRefine((values, ctx) => {
      if (!allowedSet.has(values.creatureType)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Creature type is not allowed for character sheets in this campaign',
          path: ['creatureType'],
        })
      }
    })
}

const speciesFormSchema = createSpeciesFormSchema(['humanoid'])
type SpeciesFormValues = z.infer<typeof speciesFormSchema>

// ---------------------------------------------------------------------------
// Create-form defaults
// ---------------------------------------------------------------------------

const speciesCreateDefaultValues: Partial<SpeciesFormValues> = {
  creatureType: 'humanoid',
  sizes: ['medium'],
  speed: { walk: 30 },
  traits: [],
}

// ---------------------------------------------------------------------------
// Tab field builders
// ---------------------------------------------------------------------------

function attributesFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      kind: 'row',
      fields: [
        {
          type: 'select',
          name: 'creatureType',
          label: 'Creature type',
          options: getCharacterCreatureTypeFieldOptions(ctx),
          required: true,
          width: 'lg',
        },
        walkSpeedInlineCountField('speed.walk', {
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

function buildSpeciesTabs(ctx: ContentFormCtx): TabbedFormTab[] {
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
  ]
}

// ---------------------------------------------------------------------------
// Species ContentFormDef
// ---------------------------------------------------------------------------

const speciesFormDef: ContentFormDef<Species, SpeciesFormValues, CreateSpeciesInput> = {
  routeKey: 'species',

  schema: speciesFormSchema,
  resolveSchema: (ctx) => createSpeciesFormSchema(allowedCharacterCreatureTypesFromCtx(ctx)),
  createDefaultValues: speciesCreateDefaultValues,

  buildTabs: buildSpeciesTabs,
  buildFields: (ctx) => contentFormFields(speciesFormDef, ctx),

  toFormValues: (entity) => ({
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    creatureType: entity.creatureType,
    sizes: entity.sizes,
    speed: { walk: entity.speed.walk },
    traits: entity.traits.map(traitToFormRow),
    heritage: entity.heritage ? heritageToFormRow(entity.heritage) : undefined,
  }),

  toInput: (values, ctx?: ContentFormInputCtx<Species>) =>
    finalizeContentInput(
      {
        ...envelopeSlugFields(values.name, ctx),
        name: values.name,
        description: values.description || undefined,
        creatureType: values.creatureType,
        sizes: values.sizes,
        speed: { walk: values.speed.walk },
        traits: traitsFromFormValues(values.traits, ctx?.entity?.traits),
        heritage: heritageFromFormValues(values.heritage, ctx?.entity?.heritage),
      },
      ctx,
    ) as CreateSpeciesInput,

  useListQuery: useSpecies,
  queryKey: speciesQueryKey,

  extractEmbeddedSeedRowIds: (entity) => ({
    traits: entity.traits.map((trait) => trait.id),
    'heritage.options': entity.heritage?.options.map((option) => option.id) ?? [],
  }),
}

contentFormRegistry['species'] = speciesFormDef

export { speciesFormDef }
export type { SpeciesFormValues }
