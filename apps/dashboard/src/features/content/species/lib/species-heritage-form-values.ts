import {
  resolveContentCampaignAccess,
  resolveTraitDisplay,
  type GrantContentTrait,
  type SpeciesHeritage,
  type SpeciesHeritageOption,
} from '@rpg/contracts'
import { buildItemDefaultValues } from '@rpg/ui/form'

import { applyStableIdsForUpdate } from '../../lib/forms/registry/content-form-key-helpers'
import {
  isDefaultCampaignAccessPatch,
  toCampaignAccessPatch,
} from '../../lib/campaign-access/campaign-access-state'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { grantGroupsToFormRows } from '../../lib/forms/grants/grant-form-values'
import {
  type HeritageForm,
  type HeritageOptionRowForm,
  heritageScalarFields,
} from './species-heritage-form-fields'
import { heritageOptionItemFields } from './species-trait-form-fields'
import type { TraitRowForm } from './species-trait-form-fields'
import {
  heritageOptionItemDefaultValues,
  traitFromFormRow,
  traitRowNameForIdAssignment,
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
    campaignAccess: heritageCampaignAccessToForm(option),
  }
}

function heritageCampaignAccessToForm(option: SpeciesHeritageOption) {
  const resolved = resolveContentCampaignAccess(option.campaignAccess)
  return {
    available: resolved.available,
    visibilityMode: resolved.visibilityMode,
    participantIds: [...resolved.participantIds, ...resolved.unavailableParticipantIds],
  }
}

export function heritageOptionToFormRow(
  option: SpeciesHeritage['options'][number],
): HeritageOptionRowForm {
  const campaignAccess = heritageCampaignAccessToForm(option)
  if (option.kind === 'grant') {
    return {
      ...heritageGrantOptionToCustomFormRow(option),
      campaignAccess,
    }
  }
  return { ...traitToFormRow(option), kind: 'custom', campaignAccess }
}

function heritageCampaignAccessFromForm(row: HeritageOptionRowForm) {
  const patch = toCampaignAccessPatch(row.campaignAccess)
  return isDefaultCampaignAccessPatch(patch) ? undefined : patch
}

function heritageOptionFromFormRow(
  row: HeritageOptionRowForm & { id: string },
): SpeciesHeritageOption {
  const { campaignAccess: _campaignAccess, ...traitRow } = row
  const trait = traitFromFormRow({ ...traitRow, available: true } as TraitRowForm & { id: string })
  const campaignAccess = heritageCampaignAccessFromForm(row)
  return campaignAccess ? { ...trait, campaignAccess } : trait
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
  const namedOptions = row.options.map((option, index) => ({
    ...option,
    name: traitRowNameForIdAssignment(option as unknown as TraitRowForm, index),
  }))
  const options = applyStableIdsForUpdate(namedOptions, existing?.options).map(
    heritageOptionFromFormRow,
  )
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
    options: [heritageOptionItemDefaultValues(heritageOptionItemFields(ctx))],
  }
}
