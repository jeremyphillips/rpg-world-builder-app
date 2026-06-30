import {
  DEFAULT_EDITION_PRESET_ID,
  getEditionPresetMechanics,
  mechanicsDriftFromPreset,
  resolveMechanicsKnobsFromPatch,
  resolveMechanicsPatch,
} from '@rpg/contracts'
import type {
  CampaignMechanicsPatch,
  EditionPresetId,
  SystemRulesetId,
  UpdateCampaignMechanicsInput,
} from '@rpg/contracts'

import {
  applySparsePatchUpdate,
  loadPatchDocument,
  requireCampaignRuleset,
  type SparsePatchUpdateOps,
} from '../lib/patch-document'
import { sparseSetOrUnset } from './sparse-patch-helpers'

const MECHANICS_PREFIX = 'mechanics.'

type MongoUpdateOps = SparsePatchUpdateOps

/** Normalizes Date `appliedAt` values from Mongo to ISO strings for contract resolution. */
export function normalizeMechanicsPatchFromDoc(
  mechanics: CampaignMechanicsPatch | undefined,
): CampaignMechanicsPatch | undefined {
  if (!mechanics?.editionPreset?.appliedAt) return mechanics

  const appliedAt = mechanics.editionPreset.appliedAt as string | Date | undefined
  if (appliedAt instanceof Date) {
    return {
      ...mechanics,
      editionPreset: {
        ...mechanics.editionPreset,
        appliedAt: appliedAt.toISOString(),
      },
    }
  }

  return mechanics
}

function computeMechanicsPatchMetadata(
  patch: CampaignMechanicsPatch,
  options?: { appliedAt?: string; presetIdChanged?: boolean },
): CampaignMechanicsPatch {
  const presetId = (patch.editionPreset?.id ?? DEFAULT_EDITION_PRESET_ID) as EditionPresetId
  const knobs = resolveMechanicsKnobsFromPatch(patch, presetId)
  const bundle = getEditionPresetMechanics(presetId)
  const modified = mechanicsDriftFromPreset(presetId, knobs)
  const appliedAt =
    options?.presetIdChanged === true
      ? options.appliedAt
      : (patch.editionPreset?.appliedAt ?? options?.appliedAt)

  const result: CampaignMechanicsPatch = {
    editionPreset: {
      id: presetId,
      modified,
      ...(appliedAt !== undefined && { appliedAt }),
    },
  }

  if (
    knobs.armorClass.mode !== bundle.armorClass.mode ||
    knobs.armorClass.base !== bundle.armorClass.base
  ) {
    result.armorClass = knobs.armorClass
  }

  if (knobs.attackResolution.mode !== bundle.attackResolution.mode) {
    result.attackResolution = knobs.attackResolution
  }

  return result
}

function mergeMechanicsPatch(
  existing: CampaignMechanicsPatch | undefined,
  input: UpdateCampaignMechanicsInput,
): CampaignMechanicsPatch {
  const existingPresetId = (existing?.editionPreset?.id ??
    DEFAULT_EDITION_PRESET_ID) as EditionPresetId
  const inputPresetId = input.editionPreset?.id
  const presetIdChanging = inputPresetId !== undefined && inputPresetId !== existingPresetId

  if (presetIdChanging && inputPresetId !== undefined) {
    const bundle = getEditionPresetMechanics(inputPresetId)
    return computeMechanicsPatchMetadata(
      {
        editionPreset: { id: inputPresetId },
        armorClass: { ...bundle.armorClass },
        attackResolution: { ...bundle.attackResolution },
      },
      {
        appliedAt:
          inputPresetId === DEFAULT_EDITION_PRESET_ID ? undefined : new Date().toISOString(),
        presetIdChanged: true,
      },
    )
  }

  const merged: CampaignMechanicsPatch = { ...(existing ?? {}) }

  if (inputPresetId !== undefined) {
    merged.editionPreset = {
      ...(merged.editionPreset ?? {}),
      id: inputPresetId,
    }
  }

  if (input.armorClass !== undefined) {
    merged.armorClass = {
      ...(merged.armorClass ?? {}),
      ...input.armorClass,
    }
  }

  if (input.attackResolution !== undefined) {
    merged.attackResolution = {
      ...(merged.attackResolution ?? {}),
      ...input.attackResolution,
    }
  }

  return computeMechanicsPatchMetadata(merged)
}

function isSparseDefaultMechanicsPatch(patch: CampaignMechanicsPatch): boolean {
  const presetId = patch.editionPreset?.id ?? DEFAULT_EDITION_PRESET_ID
  if (presetId !== DEFAULT_EDITION_PRESET_ID) return false
  if (patch.editionPreset?.modified === true) return false
  if (patch.editionPreset?.appliedAt !== undefined) return false
  if (patch.armorClass !== undefined) return false
  if (patch.attackResolution !== undefined) return false
  return true
}

function buildEditionPresetUpdateSet(
  ops: MongoUpdateOps,
  editionPreset: CampaignMechanicsPatch['editionPreset'],
  prefix: string,
): void {
  const presetId = editionPreset?.id ?? DEFAULT_EDITION_PRESET_ID
  sparseSetOrUnset(
    ops,
    `${prefix}editionPreset.id`,
    presetId === DEFAULT_EDITION_PRESET_ID ? undefined : presetId,
  )
  sparseSetOrUnset(
    ops,
    `${prefix}editionPreset.modified`,
    editionPreset?.modified === true ? true : undefined,
  )
  sparseSetOrUnset(
    ops,
    `${prefix}editionPreset.appliedAt`,
    editionPreset?.appliedAt !== undefined ? new Date(editionPreset.appliedAt) : undefined,
  )
}

function buildMechanicsKnobsUpdateSet(
  ops: MongoUpdateOps,
  patch: CampaignMechanicsPatch,
  prefix: string,
): void {
  if (patch.armorClass !== undefined) {
    ops.$set[`${prefix}armorClass.mode`] = patch.armorClass.mode
    ops.$set[`${prefix}armorClass.base`] = patch.armorClass.base
  } else {
    ops.$unset[`${prefix}armorClass`] = 1
  }

  sparseSetOrUnset(ops, `${prefix}attackResolution.mode`, patch.attackResolution?.mode)
}

function buildMechanicsUpdateSet(patch: CampaignMechanicsPatch): MongoUpdateOps {
  if (isSparseDefaultMechanicsPatch(patch)) {
    return { $set: {}, $unset: { mechanics: 1 } }
  }

  const ops: MongoUpdateOps = { $set: {}, $unset: {} }
  const prefix = MECHANICS_PREFIX

  buildEditionPresetUpdateSet(ops, patch.editionPreset, prefix)
  buildMechanicsKnobsUpdateSet(ops, patch, prefix)

  return ops
}

async function applyMechanicsUpdate(
  campaignId: string,
  rulesetId: SystemRulesetId,
  patch: CampaignMechanicsPatch,
): Promise<void> {
  await applySparsePatchUpdate(campaignId, rulesetId, buildMechanicsUpdateSet(patch))
}

/** Merges a partial mechanics patch and persists sparse overrides. */
export async function updateMechanicsPatch(
  campaignId: string,
  input: UpdateCampaignMechanicsInput,
): Promise<void> {
  const { rulesetId } = await requireCampaignRuleset(campaignId)

  const patchDoc = await loadPatchDocument(campaignId, rulesetId)
  const existing = normalizeMechanicsPatchFromDoc(
    patchDoc?.mechanics as CampaignMechanicsPatch | undefined,
  )
  const merged = mergeMechanicsPatch(existing, input)

  await applyMechanicsUpdate(campaignId, rulesetId, merged)
}

/** Default mechanics require no persisted overrides — resolved on read as 5e. */
export async function writeInitialMechanics(
  _campaignId: string,
  _rulesetId: SystemRulesetId,
): Promise<void> {
  // Intentionally sparse: resolveMechanicsPatch(undefined) applies 5e defaults.
}

/** Resolves stored mechanics patch for read responses. */
export function resolveStoredMechanicsPatch(
  mechanics: CampaignMechanicsPatch | undefined,
): ReturnType<typeof resolveMechanicsPatch> {
  return resolveMechanicsPatch(normalizeMechanicsPatchFromDoc(mechanics))
}
