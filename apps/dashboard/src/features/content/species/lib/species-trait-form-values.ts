import { type SpeciesBodyTrait, resolveGrantGroupsFromContent } from '@rpg/contracts'
import { buildItemDefaultValues, type FormItem } from '@rpg/ui/form'

import { applyStableIdsForUpdate } from '../../lib/forms/registry/content-form-key-helpers'
import {
  mapBodyRowAvailableFromForm,
  mapBodyRowAvailableToForm,
} from '../../lib/master-detail/body-row-availability-form.lib'
import {
  grantGroupsToFormRows,
  formRowsToGrantGroups,
} from '../../lib/forms/grants/grant-form-values'
import {
  createHeritageOptionCampaignAccessDefaults,
  traitItemTitle,
  type TraitRowForm,
} from './species-trait-form-fields'
import type { HeritageOptionRowForm } from './species-heritage-form-fields'

export function createTraitRowDefaultValues(): TraitRowForm {
  return {
    kind: 'custom',
    overrideDisplay: false,
    name: '',
    description: '',
    grants: [],
    available: true,
  }
}

export function traitItemDefaultValues(itemFields: FormItem[]): TraitRowForm {
  return {
    ...buildItemDefaultValues(itemFields),
    ...createTraitRowDefaultValues(),
  }
}

export function heritageOptionItemDefaultValues(itemFields: FormItem[]): HeritageOptionRowForm {
  return {
    ...traitItemDefaultValues(itemFields),
    kind: 'custom',
    campaignAccess: createHeritageOptionCampaignAccessDefaults(),
  }
}

function readTraitAvailability(trait: SpeciesBodyTrait): boolean {
  return mapBodyRowAvailableToForm('available' in trait ? trait.available : undefined)
}

export function traitToFormRow(trait: SpeciesBodyTrait): TraitRowForm {
  const available = readTraitAvailability(trait)
  if (trait.kind === 'grant') {
    const hasOverrides = Boolean(trait.nameOverride || trait.descriptionOverride)
    return {
      id: trait.id,
      kind: 'grant',
      overrideDisplay: hasOverrides,
      nameOverride: trait.nameOverride,
      descriptionOverride: trait.descriptionOverride,
      grants: grantGroupsToFormRows(trait.grantGroups),
      available,
    }
  }
  const grants = grantGroupsToFormRows(resolveGrantGroupsFromContent(trait))
  return {
    id: trait.id,
    kind: 'custom',
    overrideDisplay: false,
    name: trait.name,
    description: trait.description,
    grants,
    available,
  }
}

export function traitFromFormRow(row: TraitRowForm & { id: string }): SpeciesBodyTrait {
  const available = mapBodyRowAvailableFromForm(row.available)
  if (row.kind === 'grant') {
    const grantGroups = formRowsToGrantGroups(row.grants)
    return {
      kind: 'grant',
      id: row.id,
      grantGroups,
      nameOverride: row.nameOverride || undefined,
      descriptionOverride: row.descriptionOverride || undefined,
      ...(available === false ? { available: false } : {}),
    }
  }
  const grantGroups = formRowsToGrantGroups(row.grants)
  return {
    kind: 'custom',
    id: row.id,
    name: row.name!,
    description: row.description || undefined,
    ...(grantGroups.length ? { grantGroups } : {}),
    ...(available === false ? { available: false } : {}),
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
  existing?: readonly SpeciesBodyTrait[],
): SpeciesBodyTrait[] {
  return applyStableIdsForUpdate(traitRowsWithNamesForIdAssignment(rows), existing).map(
    traitFromFormRow,
  )
}
