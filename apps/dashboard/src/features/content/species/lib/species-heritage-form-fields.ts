import { z } from 'zod'
import {
  SPECIES_CHOICE_KINDS,
  SPECIES_CHOICE_KIND_LABELS,
  speciesChoiceKindSchema,
  type SpeciesHeritage,
} from '@rpg/contracts'
import { buildItemDefaultValues, toOptions, type FormItem } from '@rpg/ui/form'

import { applyStableIdsForUpdate } from '../../lib/content-form-key-helpers'
import type { ContentFormCtx } from '../../lib/content-form-registry'
import {
  traitFromFormRow,
  traitItemFields,
  traitRowFormSchema,
  traitRowsWithNamesForIdAssignment,
  traitToFormRow,
  type TraitRowForm,
} from './species-trait-form-fields'

const choiceKindOptions = toOptions(SPECIES_CHOICE_KINDS, SPECIES_CHOICE_KIND_LABELS)

export const heritageFormSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  kind: speciesChoiceKindSchema,
  description: z.string().optional(),
  options: z.array(traitRowFormSchema).min(1),
})

export type HeritageForm = z.infer<typeof heritageFormSchema>

export function heritageScalarFields(_ctx: ContentFormCtx): FormItem[] {
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

export function heritageToFormRow(heritage: SpeciesHeritage): HeritageForm {
  return {
    id: heritage.id,
    name: heritage.name,
    kind: heritage.kind,
    description: heritage.description,
    options: heritage.options.map(traitToFormRow),
  }
}

export function heritageFromFormRow(
  row: HeritageForm & { id: string },
  existing?: SpeciesHeritage,
): SpeciesHeritage {
  const options = applyStableIdsForUpdate(
    traitRowsWithNamesForIdAssignment(row.options),
    existing?.options,
  ).map(traitFromFormRow)
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    description: row.description || undefined,
    options,
  }
}

export function heritageFromFormValues(
  row: HeritageForm | undefined,
  existing?: SpeciesHeritage,
): SpeciesHeritage | undefined {
  if (!row?.name?.trim()) return undefined

  const assigned = applyStableIdsForUpdate(
    [{ ...row, name: row.name.trim() }],
    existing ? [existing] : undefined,
  )
  const withId = assigned[0]
  if (!withId) return undefined
  return heritageFromFormRow(withId, existing)
}

export function heritageDefaultValues(ctx: ContentFormCtx): HeritageForm {
  return {
    ...(buildItemDefaultValues(heritageScalarFields(ctx)) as Pick<
      HeritageForm,
      'name' | 'kind' | 'description'
    >),
    options: [buildItemDefaultValues(traitItemFields(ctx)) as TraitRowForm],
  }
}

export function addHeritageLabel(kind?: (typeof SPECIES_CHOICE_KINDS)[number]): string {
  if (kind === 'ancestry') return 'Add ancestry'
  if (kind === 'lineage') return 'Add lineage'
  return 'Add lineage/ancestry'
}
