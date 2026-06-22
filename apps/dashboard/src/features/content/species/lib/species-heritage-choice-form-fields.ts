import { z } from 'zod'
import {
  SPECIES_CHOICE_KINDS,
  SPECIES_CHOICE_KIND_LABELS,
  speciesChoiceKindSchema,
  type Species,
  type SpeciesChoiceKind,
  type SpeciesHeritageChoice,
} from '@rpg/contracts'
import { buildItemDefaultValues, toOptions, type FormItem } from '@rpg/ui/form'

import { applyStableIdsForUpdate } from '../../lib/content-form-key-helpers'
import type { ContentFormCtx } from '../../lib/content-form-registry'
import {
  traitFromFormRow,
  traitItemFields,
  traitItemTitle,
  traitRowFormSchema,
  traitRowsWithNamesForIdAssignment,
  traitToFormRow,
  type TraitRowForm,
} from './species-trait-form-fields'

const choiceKindOptions = toOptions(SPECIES_CHOICE_KINDS, SPECIES_CHOICE_KIND_LABELS)

export const heritageChoiceRowFormSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  kind: speciesChoiceKindSchema,
  description: z.string().optional(),
  options: z.array(traitRowFormSchema).min(1),
})

export type HeritageChoiceRowForm = z.infer<typeof heritageChoiceRowFormSchema>

export function heritageChoiceScalarFields(_ctx: ContentFormCtx): FormItem[] {
  return [
    {
      kind: 'row',
      fields: [
        { type: 'text', name: 'name', label: 'Name', required: true },
        {
          type: 'select',
          name: 'kind',
          label: 'Kind',
          options: choiceKindOptions,
          required: true,
          defaultValue: SPECIES_CHOICE_KINDS[0],
        },
      ],
    },
    { type: 'richtext', name: 'description', label: 'Description' },
  ]
}

export function heritageChoiceItemTitle(values: Record<string, unknown>, index: number): string {
  return (values.name as string) || `Heritage choice ${index + 1}`
}

export function heritageChoiceEyebrow(kind: SpeciesChoiceKind | undefined): string | undefined {
  if (!kind) return undefined
  return SPECIES_CHOICE_KIND_LABELS[kind]
}

export function heritageChoiceToFormRow(choice: SpeciesHeritageChoice): HeritageChoiceRowForm {
  return {
    id: choice.id,
    name: choice.name,
    kind: choice.kind,
    description: choice.description,
    options: choice.options.map(traitToFormRow),
  }
}

export function heritageChoiceFromFormRow(
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

export function heritageChoicesFromFormValues(
  rows: HeritageChoiceRowForm[] | undefined,
  existing?: Species['heritageChoices'],
): SpeciesHeritageChoice[] | undefined {
  if (!rows?.length) return undefined

  return applyStableIdsForUpdate(rows, existing).map((row) => {
    const existingChoice = existing?.find((choice) => choice.id === row.id)
    return heritageChoiceFromFormRow(row, existingChoice)
  })
}

export function heritageChoiceDefaultValues(ctx: ContentFormCtx): HeritageChoiceRowForm {
  return {
    ...(buildItemDefaultValues(heritageChoiceScalarFields(ctx)) as Pick<
      HeritageChoiceRowForm,
      'name' | 'kind' | 'description'
    >),
    options: [buildItemDefaultValues(traitItemFields(ctx)) as TraitRowForm],
  }
}

/** Full inline array item fields (scalar + nested options) — used until heritage tab migration. */
export function heritageChoiceItemFields(ctx: ContentFormCtx): FormItem[] {
  return [
    ...heritageChoiceScalarFields(ctx),
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
