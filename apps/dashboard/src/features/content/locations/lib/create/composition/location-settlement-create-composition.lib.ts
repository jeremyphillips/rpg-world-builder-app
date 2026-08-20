import {
  getSettlementTypeLabel,
  type ContentCampaignAccessPatch,
  type CreateLocationInput,
  type SettlementType,
} from '@rpg/contracts'

import { createWithDeferredCampaignAccess } from '../../../../lib/campaign-access/create-with-deferred-campaign-access'
import { createContent } from '../../../../lib/list/content-client'

import { buildLocationCreateInput } from '../../location-form-values'
import type { LocationFormValues } from '../../location-form-fields'

export type SettlementDistrictDraft = {
  id: string
  name: string
}

export type SettlementCreateComposition = {
  districts: SettlementDistrictDraft[]
}

export const EMPTY_SETTLEMENT_CREATE_COMPOSITION: SettlementCreateComposition = {
  districts: [],
}

export type SettlementStructureAuthoringGuidance = {
  helper: string
  emphasis: string
}

export type SettlementCreateCompositionValidationResult =
  | { ok: true }
  | { ok: false; message: string }

export type CreateSettlementWithStartingDistrictsParams = {
  campaignId: string
  routeKey: string
  settlementCreateInput: CreateLocationInput
  pendingAccess: ContentCampaignAccessPatch | null
  composition: SettlementCreateComposition
}

export type CreateSettlementWithStartingDistrictsResult = {
  settlement: { id: string }
  deferredAccessFailed: boolean
  districts: {
    created: Array<{ id: string; name: string }>
    failed: Array<{ name: string }>
  }
}

export type SettlementCreateCompletionToast =
  | { kind: 'success' }
  | { kind: 'warning'; message: string }

const SETTLEMENT_CREATE_COMPOSITION_VALIDATION = {
  blankDistrictName: 'Each starting district needs a name.',
  duplicateDistrictName: 'Starting district names must be unique.',
} as const

export function createSettlementDistrictDraftId(): string {
  return crypto.randomUUID()
}

export function addSettlementDistrictDraft(
  composition: SettlementCreateComposition,
): SettlementCreateComposition {
  return {
    districts: [...composition.districts, { id: createSettlementDistrictDraftId(), name: '' }],
  }
}

export function updateSettlementDistrictDraft(
  composition: SettlementCreateComposition,
  districtId: string,
  name: string,
): SettlementCreateComposition {
  return {
    districts: composition.districts.map((district) =>
      district.id === districtId ? { ...district, name } : district,
    ),
  }
}

export function removeSettlementDistrictDraft(
  composition: SettlementCreateComposition,
  districtId: string,
): SettlementCreateComposition {
  return {
    districts: composition.districts.filter((district) => district.id !== districtId),
  }
}

export function isSettlementCreateCompositionDirty(
  composition: SettlementCreateComposition,
): boolean {
  return JSON.stringify(composition) !== JSON.stringify(EMPTY_SETTLEMENT_CREATE_COMPOSITION)
}

function normalizeDistrictName(name: string): string {
  return name.trim().toLocaleLowerCase()
}

export function validateSettlementCreateComposition(
  composition: SettlementCreateComposition,
): SettlementCreateCompositionValidationResult {
  const seen = new Set<string>()

  for (const district of composition.districts) {
    const trimmedName = district.name.trim()
    if (!trimmedName) {
      return { ok: false, message: SETTLEMENT_CREATE_COMPOSITION_VALIDATION.blankDistrictName }
    }

    const normalized = normalizeDistrictName(trimmedName)
    if (seen.has(normalized)) {
      return { ok: false, message: SETTLEMENT_CREATE_COMPOSITION_VALIDATION.duplicateDistrictName }
    }
    seen.add(normalized)
  }

  return { ok: true }
}

export function resolveSettlementStructureAuthoringGuidance(
  settlementType: SettlementType,
): SettlementStructureAuthoringGuidance {
  const settlementLabel = getSettlementTypeLabel(settlementType).toLocaleLowerCase()

  switch (settlementType) {
    case 'metropolis':
    case 'city':
      return {
        helper: `Optional neighborhoods or wards to seed under this ${settlementLabel}.`,
        emphasis: 'Large settlements often start with a few named districts you can expand later.',
      }
    case 'town':
      return {
        helper: `Optional districts or quarters under this ${settlementLabel}.`,
        emphasis: 'Add one or two starting districts if the town spans distinct areas.',
      }
    case 'village':
    case 'hamlet':
      return {
        helper: `Optional named areas under this ${settlementLabel}.`,
        emphasis: 'Smaller settlements rarely need districts, but you can add one when it helps.',
      }
    default:
      return {
        helper: `Optional districts under this ${settlementLabel}.`,
        emphasis: 'Starting districts are created as child locations under the settlement.',
      }
  }
}

export function buildStartingDistrictCreateInput({
  settlementId,
  name,
}: {
  settlementId: string
  name: string
}): CreateLocationInput {
  const values: LocationFormValues = {
    name: name.trim(),
    authoringType: 'district',
    parentLocationId: settlementId,
  }

  return buildLocationCreateInput(values, undefined, 'publish')
}

export async function createSettlementWithStartingDistricts({
  campaignId,
  routeKey,
  settlementCreateInput,
  pendingAccess,
  composition,
}: CreateSettlementWithStartingDistrictsParams): Promise<CreateSettlementWithStartingDistrictsResult> {
  const { entity: settlement, deferredAccessFailed } = await createWithDeferredCampaignAccess({
    campaignId,
    routeKey,
    createInput: settlementCreateInput,
    mutateAsync: (input) =>
      createContent<{ id: string }>(campaignId, routeKey, input, 'Could not create locations.'),
    pendingAccess,
  })

  const created: Array<{ id: string; name: string }> = []
  const failed: Array<{ name: string }> = []

  for (const district of composition.districts) {
    const trimmedName = district.name.trim()
    if (!trimmedName) continue

    try {
      const districtInput = buildStartingDistrictCreateInput({
        settlementId: settlement.id,
        name: trimmedName,
      })
      const districtEntity = await createContent<{ id: string }>(
        campaignId,
        routeKey,
        districtInput,
        'Could not create locations.',
      )
      created.push({ id: districtEntity.id, name: trimmedName })
    } catch {
      failed.push({ name: trimmedName })
    }
  }

  return {
    settlement,
    deferredAccessFailed,
    districts: { created, failed },
  }
}

function formatIncompleteParts({
  deferredAccessFailed,
  districtsFailedCount,
}: {
  deferredAccessFailed: boolean
  districtsFailedCount: number
}): string[] {
  const parts: string[] = []

  if (deferredAccessFailed) {
    parts.push('campaign access')
  }

  if (districtsFailedCount === 1) {
    parts.push('1 starting district')
  } else if (districtsFailedCount > 1) {
    parts.push(`${districtsFailedCount} starting districts`)
  }

  return parts
}

/** Resolves a single success or aggregated warning toast for settlement create completion. */
export function resolveSettlementCreateCompletionToast({
  settlementType,
  deferredAccessFailed,
  districtsFailedCount,
}: {
  settlementType: SettlementType
  deferredAccessFailed: boolean
  districtsFailedCount: number
}): SettlementCreateCompletionToast {
  if (!deferredAccessFailed && districtsFailedCount === 0) {
    return { kind: 'success' }
  }

  const settlementLabel = getSettlementTypeLabel(settlementType)
  const incompleteParts = formatIncompleteParts({ deferredAccessFailed, districtsFailedCount })

  if (incompleteParts.length === 0) {
    return { kind: 'success' }
  }

  const incompleteSummary =
    incompleteParts.length === 1
      ? incompleteParts[0]
      : `${incompleteParts.slice(0, -1).join(', ')} and ${incompleteParts.at(-1)}`

  return {
    kind: 'warning',
    message: `${settlementLabel} created, but ${incompleteSummary} could not be completed.`,
  }
}
