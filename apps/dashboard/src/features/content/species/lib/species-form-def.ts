import { createElement } from 'react'
import { z } from 'zod'
import {
  CREATURE_SIZES,
  CREATURE_SIZE_ENTRIES,
  CREATURE_TYPES,
  CREATURE_TYPE_ENTRIES,
  SPECIES_CHOICE_KINDS,
  SPECIES_CHOICE_KIND_LABELS,
  STANDARD_SPEEDS,
  creatureSizeSchema,
  creatureTypeSchema,
  speciesChoiceKindSchema,
  slugSchema,
  type CreateSpeciesInput,
  type Species,
  type SpeciesHeritageChoice,
} from '@rpg/contracts'
import { toOptions, type FieldOption, type FormItem, type TabbedFormTab } from '@rpg/ui/form'

import { identityFields } from '../../lib/content-form-field-helpers'
import {
  applyStableIdsForUpdate,
  envelopeSlugFields,
  finalizeContentInput,
} from '../../lib/content-form-key-helpers'
import {
  contentFormRegistry,
  contentFormFields,
  type ContentFormCtx,
  type ContentFormDef,
  type ContentFormInputCtx,
} from '../../lib/content-form-registry'
import { SpeciesTraitsTab } from '../components/species-traits-tab.client'
import { useSpecies, speciesQueryKey } from '../hooks/use-species'
import {
  traitItemFields,
  traitItemTitle,
  traitRowFormSchema,
  traitRowsWithNamesForIdAssignment,
  traitToFormRow,
  traitFromFormRow,
  traitsFromFormValues,
} from './species-trait-form-fields'

// ---------------------------------------------------------------------------
// Vocab option lists
// ---------------------------------------------------------------------------

const creatureTypeOptions = toOptions(
  CREATURE_TYPES,
  Object.fromEntries(CREATURE_TYPES.map((t) => [t, CREATURE_TYPE_ENTRIES[t].label])) as Record<
    (typeof CREATURE_TYPES)[number],
    string
  >,
)

const creatureSizeOptions = toOptions(
  CREATURE_SIZES,
  Object.fromEntries(CREATURE_SIZES.map((s) => [s, CREATURE_SIZE_ENTRIES[s].label])) as Record<
    (typeof CREATURE_SIZES)[number],
    string
  >,
)

const speedWalkOptions: FieldOption[] = STANDARD_SPEEDS.map((s) => ({
  value: String(s),
  label: `${s} ft.`,
}))

const choiceKindOptions = toOptions(SPECIES_CHOICE_KINDS, SPECIES_CHOICE_KIND_LABELS)

// ---------------------------------------------------------------------------
// Form schema
// ---------------------------------------------------------------------------

const heritageChoiceRowFormSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  kind: speciesChoiceKindSchema,
  description: z.string().optional(),
  options: z.array(traitRowFormSchema).min(1),
})
type HeritageChoiceRowForm = z.infer<typeof heritageChoiceRowFormSchema>

const speciesFormSchema = z.object({
  name: z.string().min(1),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  creatureType: creatureTypeSchema,
  sizes: z.array(creatureSizeSchema).min(1),
  speed: z.object({
    walk: z.coerce.number().int().min(0),
  }),
  traits: z.array(traitRowFormSchema),
  heritageChoices: z.array(heritageChoiceRowFormSchema).optional(),
})
type SpeciesFormValues = z.infer<typeof speciesFormSchema>

// ---------------------------------------------------------------------------
// Field builders
// ---------------------------------------------------------------------------

function heritageChoiceItemFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      kind: 'row',
      fields: [
        { type: 'text', name: 'name', label: 'Name', required: true },
        { type: 'select', name: 'kind', label: 'Kind', options: choiceKindOptions, required: true },
      ],
    },
    { type: 'richtext', name: 'description', label: 'Description' },
    {
      kind: 'array',
      name: 'options',
      legend: 'Options',
      addLabel: 'Add option',
      min: 1,
      itemTitle: traitItemTitle,
      fields: traitItemFields(ctx),
    },
  ]
}

function heritageChoiceFromFormRow(
  row: HeritageChoiceRowForm & { id: string },
  existingChoice?: SpeciesHeritageChoice,
): SpeciesHeritageChoice {
  const options = applyStableIdsForUpdate(
    traitRowsWithNamesForIdAssignment(row.options),
    existingChoice?.options,
  ).map(traitFromFormRow)
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    description: row.description || undefined,
    options,
  }
}

function heritageChoicesFromFormValues(
  rows: HeritageChoiceRowForm[] | undefined,
  existing?: Species['heritageChoices'],
): SpeciesHeritageChoice[] | undefined {
  if (!rows?.length) return undefined

  return applyStableIdsForUpdate(rows, existing).map((row) => {
    const existingChoice = existing?.find((choice) => choice.id === row.id)
    return heritageChoiceFromFormRow(row, existingChoice)
  })
}

function heritageChoiceToFormRow(choice: SpeciesHeritageChoice): HeritageChoiceRowForm {
  return {
    id: choice.id,
    name: choice.name,
    kind: choice.kind,
    description: choice.description,
    options: choice.options.map(traitToFormRow),
  }
}

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

function attributesFields(): FormItem[] {
  return [
    {
      kind: 'row',
      fields: [
        {
          type: 'select',
          name: 'creatureType',
          label: 'Creature type',
          options: creatureTypeOptions,
          required: true,
        },
        {
          type: 'select',
          name: 'speed.walk',
          label: 'Walk speed',
          options: speedWalkOptions,
          required: true,
        },
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

function heritageChoicesArrayField(ctx: ContentFormCtx): FormItem {
  return {
    kind: 'array',
    name: 'heritageChoices',
    legend: 'Heritage choices',
    addLabel: 'Add heritage choice',
    itemTitle: (values, index) => (values['name'] as string) || `Heritage choice ${index + 1}`,
    fields: heritageChoiceItemFields(ctx),
  }
}

function buildSpeciesTabs(ctx: ContentFormCtx): TabbedFormTab[] {
  return [
    {
      id: 'basics',
      label: 'Basics',
      fields: [...identityFields(), ...attributesFields()],
    },
    {
      id: 'traits',
      label: 'Traits',
      fields: [],
      header: createElement(SpeciesTraitsTab, { formCtx: ctx }),
    },
    {
      id: 'heritage-choices',
      label: 'Heritage choices',
      fields: [heritageChoicesArrayField(ctx)],
    },
  ]
}

// ---------------------------------------------------------------------------
// Species ContentFormDef
// ---------------------------------------------------------------------------

const speciesFormDef: ContentFormDef<Species, SpeciesFormValues, CreateSpeciesInput> = {
  routeKey: 'species',

  schema: speciesFormSchema,
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
    heritageChoices: entity.heritageChoices?.map(heritageChoiceToFormRow) ?? [],
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
        heritageChoices: heritageChoicesFromFormValues(
          values.heritageChoices,
          ctx?.entity?.heritageChoices,
        ),
      },
      ctx,
    ) as CreateSpeciesInput,

  useListQuery: useSpecies,
  queryKey: speciesQueryKey,
}

contentFormRegistry['species'] = speciesFormDef

export { speciesFormDef }
export type { SpeciesFormValues }
