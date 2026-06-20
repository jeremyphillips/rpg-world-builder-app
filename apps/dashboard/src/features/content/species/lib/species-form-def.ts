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
  type ContentTrait,
  type CreateSpeciesInput,
  type Species,
  type SpeciesHeritageChoice,
} from '@rpg/contracts'
import { toOptions, type FieldOption, type FormItem } from '@rpg/ui/form'

import {
  SPECIES_GRANT_TYPES,
  SPECIES_GRANT_TYPE_LABELS,
  formRowsToGrants,
  grantArrayFields,
  grantRowFormSchema,
  grantsToFormRows,
} from '../../lib/grant-form-helpers'
import { contentFormRegistry, type ContentFormDef } from '../../lib/content-form-registry'
import { useSpecies, speciesQueryKey } from '../hooks/use-species'

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

const traitRowFormSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  grants: z.array(grantRowFormSchema),
})
type TraitRowForm = z.infer<typeof traitRowFormSchema>

const heritageChoiceRowFormSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kind: speciesChoiceKindSchema,
  description: z.string().optional(),
  options: z.array(traitRowFormSchema).min(1),
})
type HeritageChoiceRowForm = z.infer<typeof heritageChoiceRowFormSchema>

const speciesFormSchema = z.object({
  name: z.string().min(1),
  slug: slugSchema,
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

function traitItemFields(): FormItem[] {
  return [
    {
      kind: 'row',
      fields: [
        {
          type: 'text',
          name: 'id',
          label: 'ID',
          hint: 'Unique slug (e.g. darkvision)',
          required: true,
        },
        { type: 'text', name: 'name', label: 'Name', required: true },
      ],
    },
    { type: 'richtext', name: 'description', label: 'Description' },
    ...grantArrayFields(SPECIES_GRANT_TYPES, SPECIES_GRANT_TYPE_LABELS),
  ]
}

function heritageChoiceItemFields(): FormItem[] {
  return [
    {
      kind: 'row',
      fields: [
        {
          type: 'text',
          name: 'id',
          label: 'ID',
          hint: 'Unique slug (e.g. draconic-ancestry)',
          required: true,
        },
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
      itemTitle: (values, index) => (values['name'] as string) || `Option ${index + 1}`,
      fields: traitItemFields(),
    },
  ]
}

// ---------------------------------------------------------------------------
// Trait conversion helpers
// ---------------------------------------------------------------------------

function traitToFormRow(trait: ContentTrait): TraitRowForm {
  return {
    id: trait.id,
    name: trait.name,
    description: trait.description,
    grants: grantsToFormRows(trait.grants),
  }
}

function traitFromFormRow(row: TraitRowForm): ContentTrait {
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    grants: formRowsToGrants(row.grants),
  }
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

function heritageChoiceFromFormRow(row: HeritageChoiceRowForm): SpeciesHeritageChoice {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    description: row.description || undefined,
    options: row.options.map(traitFromFormRow),
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
// Species ContentFormDef
// ---------------------------------------------------------------------------

const speciesFormDef: ContentFormDef<Species, SpeciesFormValues, CreateSpeciesInput> = {
  routeKey: 'species',

  schema: speciesFormSchema,
  createDefaultValues: speciesCreateDefaultValues,

  buildFields: (_ctx) => [
    {
      kind: 'group',
      legend: 'Identity',
      fields: [
        {
          kind: 'row',
          fields: [
            { type: 'text', name: 'name', label: 'Name', required: true },
            {
              type: 'text',
              name: 'slug',
              label: 'Slug',
              hint: 'Lowercase letters, numbers, hyphens',
              required: true,
            },
          ],
        },
        { type: 'richtext', name: 'description', label: 'Description' },
      ],
    },
    {
      kind: 'group',
      legend: 'Attributes',
      fields: [
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
      ],
    },
    {
      kind: 'array',
      name: 'traits',
      legend: 'Traits',
      addLabel: 'Add trait',
      itemTitle: (values, index) => (values['name'] as string) || `Trait ${index + 1}`,
      fields: traitItemFields(),
    },
    {
      kind: 'array',
      name: 'heritageChoices',
      legend: 'Heritage choices',
      addLabel: 'Add heritage choice',
      itemTitle: (values, index) => (values['name'] as string) || `Heritage choice ${index + 1}`,
      fields: heritageChoiceItemFields(),
    },
  ],

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

  toInput: (values) => ({
    name: values.name,
    slug: values.slug,
    description: values.description || undefined,
    creatureType: values.creatureType,
    sizes: values.sizes,
    speed: { walk: values.speed.walk },
    traits: values.traits.map(traitFromFormRow),
    heritageChoices: values.heritageChoices?.length
      ? values.heritageChoices.map(heritageChoiceFromFormRow)
      : undefined,
  }),

  useListQuery: useSpecies,
  queryKey: speciesQueryKey,
}

contentFormRegistry['species'] = speciesFormDef

export { speciesFormDef }
export type { SpeciesFormValues }
