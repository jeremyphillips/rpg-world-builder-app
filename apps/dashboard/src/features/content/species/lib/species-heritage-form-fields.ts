import { z } from 'zod'
import type { SpeciesHeritage } from '@rpg/contracts'
import { buildItemDefaultValues, type FormItem } from '@rpg/ui/form'

import { applyStableIdsForUpdate } from '../../lib/content-form-key-helpers'
import type { ContentFormCtx } from '../../lib/content-form-registry'
import { traitItemFields, traitRowFormSchema, type TraitRowForm } from './species-trait-form-fields'
import {
  traitFromFormRow,
  traitRowsWithNamesForIdAssignment,
  traitToFormRow,
} from './species-trait-form-values'

export const ADD_HERITAGE_LABEL = 'Add heritage'
export const HERITAGE_OPTION_NOUN = 'option'
export const ADD_HERITAGE_OPTION_LABEL = 'Add option'
export const HERITAGE_EMPTY_MESSAGE =
  'No heritage yet. Add one to define player choices at character creation.'
export const HERITAGE_NAME_HINT =
  'The name of this heritage option group, e.g. “Draconic Ancestry” or “Elven Lineage.”'

export const heritageFormSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  choose: z.coerce.number().int().min(1).default(1),
  options: z.array(traitRowFormSchema).min(1),
})

export type HeritageForm = z.infer<typeof heritageFormSchema>

export function heritageScalarFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      type: 'text',
      name: 'name',
      label: 'Name',
      required: true,
      hint: HERITAGE_NAME_HINT,
    },
    {
      type: 'richtext',
      name: 'description',
      label: 'Description',
      linkable: true,
      internalLinkOptions: ctx.options?.richTextInternalLinkOptions,
      contentTypeOptions: ctx.options?.richTextContentTypeOptions,
    },
  ]
}

export function heritageToFormRow(heritage: SpeciesHeritage): HeritageForm {
  return {
    id: heritage.id,
    name: heritage.name,
    description: heritage.description,
    choose: heritage.choose,
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
    description: row.description || undefined,
    choose: row.choose ?? existing?.choose ?? 1,
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
      'name' | 'description'
    >),
    choose: 1,
    options: [buildItemDefaultValues(traitItemFields(ctx)) as TraitRowForm],
  }
}
