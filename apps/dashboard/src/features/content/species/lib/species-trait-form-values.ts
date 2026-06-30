import { getTraitGrants, type ContentTrait } from '@rpg/contracts'

import { applyStableIdsForUpdate } from '../../lib/content-form-key-helpers'
import { formRowsToGrants, grantsToFormRows } from '../../lib/grant-form-values'
import { traitItemTitle, type TraitRowForm } from './species-trait-form-fields'

export function traitToFormRow(trait: ContentTrait): TraitRowForm {
  const grants = grantsToFormRows(getTraitGrants(trait))
  if (trait.kind === 'grant') {
    const hasOverrides = Boolean(trait.nameOverride || trait.descriptionOverride)
    return {
      id: trait.id,
      kind: 'grant',
      overrideDisplay: hasOverrides,
      nameOverride: trait.nameOverride,
      descriptionOverride: trait.descriptionOverride,
      grants,
    }
  }
  return {
    id: trait.id,
    kind: 'custom',
    overrideDisplay: false,
    name: trait.name,
    description: trait.description,
    grants,
  }
}

export function traitFromFormRow(row: TraitRowForm & { id: string }): ContentTrait {
  const grants = formRowsToGrants(row.grants)
  if (row.kind === 'grant') {
    return {
      kind: 'grant',
      id: row.id,
      grants: grants!,
      nameOverride: row.nameOverride || undefined,
      descriptionOverride: row.descriptionOverride || undefined,
    }
  }
  return {
    kind: 'custom',
    id: row.id,
    name: row.name!,
    description: row.description || undefined,
    grants,
  }
}

export function traitRowNameForIdAssignment(row: TraitRowForm, index: number): string {
  if (row.kind === 'grant') {
    return row.nameOverride?.trim() || traitItemTitle(row, index)
  }
  return row.name?.trim() || `Trait ${index + 1}`
}

export function traitRowsWithNamesForIdAssignment(
  rows: TraitRowForm[],
): Array<TraitRowForm & { name: string }> {
  return rows.map((row, index) => ({
    ...row,
    name: traitRowNameForIdAssignment(row, index),
  }))
}

export function traitsFromFormValues(
  rows: TraitRowForm[],
  existing?: readonly ContentTrait[],
): ContentTrait[] {
  return applyStableIdsForUpdate(traitRowsWithNamesForIdAssignment(rows), existing).map(
    traitFromFormRow,
  )
}
