import { resolveTraitDisplay, type GrantContentTrait, type SpeciesHeritage } from '@rpg/contracts'
import { buildItemDefaultValues } from '@rpg/ui/form'

import { applyStableIdsForUpdate } from '../../lib/forms/registry/content-form-key-helpers'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { grantGroupsToFormRows } from '../../lib/forms/grants/grant-form-values'
import {
  type HeritageForm,
  type HeritageOptionRowForm,
  heritageScalarFields,
} from './species-heritage-form-fields'
import { heritageOptionItemFields } from './species-trait-form-fields'
import {
  traitFromFormRow,
  traitItemDefaultValues,
  traitRowsWithNamesForIdAssignment,
  traitToFormRow,
} from './species-trait-form-values'

/**
 * Unexpected grant-shaped heritage options are converted to authored custom
 * rows at load so save cannot flip the discriminator on a grant-only shape.
 */
export function heritageGrantOptionToCustomFormRow(
  option: GrantContentTrait,
): HeritageOptionRowForm {
  const display = resolveTraitDisplay(option)
  return {
    id: option.id,
    kind: 'custom',
    overrideDisplay: false,
    name: display.name,
    description: display.descriptionHtml,
    grants: grantGroupsToFormRows(option.grantGroups),
  }
}

export function heritageOptionToFormRow(
  option: SpeciesHeritage['options'][number],
): HeritageOptionRowForm {
  if (option.kind === 'grant') {
    return heritageGrantOptionToCustomFormRow(option)
  }
  return { ...traitToFormRow(option), kind: 'custom' }
}

export function heritageToFormRow(heritage: SpeciesHeritage): HeritageForm {
  return {
    id: heritage.id,
    name: heritage.name,
    description: heritage.description,
    choose: heritage.choose,
    options: heritage.options.map(heritageOptionToFormRow),
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
    options: [{ ...traitItemDefaultValues(heritageOptionItemFields(ctx)), kind: 'custom' }],
  }
}
