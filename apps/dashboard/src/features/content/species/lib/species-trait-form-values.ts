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
  if (trait.kind === 'template') {
    const hasOverrides = Boolean(trait.nameOverride || trait.descriptionOverride)
    return {
      id: trait.id,
      kind: 'template',
      templateId: trait.templateId,
      config:
        trait.config && typeof trait.config === 'object'
          ? (trait.config as TraitRowForm['config'])
          : undefined,
      overrideDisplay: hasOverrides,
      nameOverride: trait.nameOverride,
      descriptionOverride: trait.descriptionOverride,
      grants: [],
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

function unavailableFlag(
  available: boolean | undefined,
): { available: false } | Record<string, never> {
  return available === false ? { available: false } : {}
}

function grantTraitFromFormRow(
  row: TraitRowForm & { id: string },
  available: boolean | undefined,
): SpeciesBodyTrait {
  return {
    kind: 'grant',
    id: row.id,
    grantGroups: formRowsToGrantGroups(row.grants),
    nameOverride: row.nameOverride || undefined,
    descriptionOverride: row.descriptionOverride || undefined,
    ...unavailableFlag(available),
  }
}

function templateTraitFromFormRow(
  row: TraitRowForm & { id: string },
  available: boolean | undefined,
): SpeciesBodyTrait {
  const uses = row.config?.uses
  return {
    kind: 'template',
    id: row.id,
    templateId: row.templateId ?? '',
    ...(uses ? { config: { uses: Number(uses) } } : {}),
    nameOverride: row.nameOverride || undefined,
    descriptionOverride: row.descriptionOverride || undefined,
    ...unavailableFlag(available),
  }
}

function customTraitFromFormRow(
  row: TraitRowForm & { id: string },
  available: boolean | undefined,
): SpeciesBodyTrait {
  const grantGroups = formRowsToGrantGroups(row.grants)
  return {
    kind: 'custom',
    id: row.id,
    name: row.name!,
    description: row.description || undefined,
    ...(grantGroups.length ? { grantGroups } : {}),
    ...unavailableFlag(available),
  }
}

export function traitFromFormRow(row: TraitRowForm & { id: string }): SpeciesBodyTrait {
  const available = mapBodyRowAvailableFromForm(row.available)
  if (row.kind === 'grant') return grantTraitFromFormRow(row, available)
  if (row.kind === 'template') return templateTraitFromFormRow(row, available)
  return customTraitFromFormRow(row, available)
}

export function traitRowNameForIdAssignment(row: TraitRowForm, index: number): string {
  if (row.kind === 'grant' || row.kind === 'template') {
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
