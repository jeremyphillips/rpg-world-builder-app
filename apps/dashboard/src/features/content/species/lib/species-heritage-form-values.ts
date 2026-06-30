import type { SpeciesHeritage } from '@rpg/contracts'
import { buildItemDefaultValues } from '@rpg/ui/form'

import { applyStableIdsForUpdate } from '../../lib/content-form-key-helpers'
import type { ContentFormCtx } from '../../lib/content-form-registry'
import { heritageScalarFields, type HeritageForm } from './species-heritage-form-fields'
import { traitItemFields, type TraitRowForm } from './species-trait-form-fields'
import {
  traitFromFormRow,
  traitRowsWithNamesForIdAssignment,
  traitToFormRow,
} from './species-trait-form-values'

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
