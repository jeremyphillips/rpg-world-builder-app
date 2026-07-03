import { type ContentTrait } from '@rpg/contracts'

import { applyStableIdsForUpdate } from '../../lib/forms/content-form-key-helpers'
import {
  grantGroupsToFormRows,
  grantsToFormRows,
  formRowsToGrantGroups,
} from '../../lib/forms/grants/grant-form-values'
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
      grants: grantGroupsToFormRows(trait.grantGroups),
    }
  }
  // Custom trait: prefer grantGroups (new model), fall back to legacy grants bag.
  const grants = trait.grantGroups?.length
    ? grantGroupsToFormRows(trait.grantGroups)
    : grantsToFormRows(trait.grants)
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
  if (row.kind === 'grant') {
    const grantGroups = formRowsToGrantGroups(row.grants)
    return {
      kind: 'grant',
      id: row.id,
      grantGroups,
      nameOverride: row.nameOverride || undefined,
      descriptionOverride: row.descriptionOverride || undefined,
    }
  }
  const grantGroups = formRowsToGrantGroups(row.grants)
  return {
    kind: 'custom',
    id: row.id,
    name: row.name!,
    description: row.description || undefined,
    ...(grantGroups.length ? { grantGroups } : {}),
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
