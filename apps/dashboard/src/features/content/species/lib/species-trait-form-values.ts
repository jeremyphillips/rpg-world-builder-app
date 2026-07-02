import { getTraitGrants, legacyGrantsToGrantGroups, type ContentTrait } from '@rpg/contracts'

import { applyStableIdsForUpdate } from '../../lib/forms/content-form-key-helpers'
import { formRowsToGrants, grantsToFormRows } from '../../lib/forms/grants/grant-form-values'
import { traitItemTitle, type TraitRowForm } from './species-trait-form-fields'

export function traitToFormRow(trait: ContentTrait): TraitRowForm {
  if (trait.kind === 'grant') {
    const hasOverrides = Boolean(trait.nameOverride || trait.descriptionOverride)
    return {
      id: trait.id,
      kind: 'grant',
      overrideDisplay: hasOverrides,
      nameOverride: trait.nameOverride,
      descriptionOverride: trait.descriptionOverride,
      // Carry grantGroups through the form state; grant form rows stay empty
      // until Phase 3 migrates the authoring UI to the atomic model.
      grants: [],
      _grantGroups: trait.grantGroups,
    }
  }
  const grants = grantsToFormRows(getTraitGrants(trait))
  return {
    id: trait.id,
    kind: 'custom',
    overrideDisplay: false,
    name: trait.name,
    description: trait.description,
    grants,
    _grantGroups: trait.grantGroups,
  }
}

export function traitFromFormRow(row: TraitRowForm & { id: string }): ContentTrait {
  if (row.kind === 'grant') {
    // Use passthrough grantGroups when available (migrated trait); otherwise
    // convert legacy form rows (authoring via old UI, Phase 3 not yet done).
    const formGrants = formRowsToGrants(row.grants)
    const grantGroups =
      row._grantGroups ?? (formGrants ? legacyGrantsToGrantGroups(formGrants) : [])
    return {
      kind: 'grant',
      id: row.id,
      grantGroups,
      nameOverride: row.nameOverride || undefined,
      descriptionOverride: row.descriptionOverride || undefined,
    }
  }
  const grants = formRowsToGrants(row.grants)
  return {
    kind: 'custom',
    id: row.id,
    name: row.name!,
    description: row.description || undefined,
    grants,
    grantGroups: row._grantGroups,
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
