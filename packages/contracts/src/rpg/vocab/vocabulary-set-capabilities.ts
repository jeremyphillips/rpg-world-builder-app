import type { VocabularyOptionSetId } from './vocabulary'
import { VOCABULARY_OPTION_SET_IDS } from './vocabulary'

/** Product capabilities for a campaign vocabulary option set. */
export type VocabularySetCapability = {
  /** Listed on Game Terms hub and readable at overview/detail routes. */
  browse: boolean
  create: boolean
  edit: boolean
  /** Delete campaign-sourced entries. Implies create. */
  delete: boolean
  /** Maps to status active/disabled in UI and PATCH. */
  availability: boolean
  bulkAvailability: boolean
  /** Usage resolution enabled — attach usedBy; enable informational GET …/usage. */
  usageResolution: boolean
  /** Overview loads may use a set-level count batch resolver (counts only). */
  batchUsageCounting: boolean
  /** Block status → disabled when referenced (preflight + PATCH 409). */
  disableGuard: boolean
  /** Block DELETE when referenced. */
  deleteGuard: boolean
}

const disabledCapabilities = (): VocabularySetCapability => ({
  browse: false,
  create: false,
  edit: false,
  delete: false,
  availability: false,
  bulkAvailability: false,
  usageResolution: false,
  batchUsageCounting: false,
  disableGuard: false,
  deleteGuard: false,
})

const browseOnlyWithUsageResolutionCapabilities = (): VocabularySetCapability => ({
  browse: true,
  create: false,
  edit: false,
  delete: false,
  availability: false,
  bulkAvailability: false,
  usageResolution: true,
  batchUsageCounting: true,
  disableGuard: false,
  deleteGuard: false,
})

const enabledManagementCapabilities = (): VocabularySetCapability => ({
  browse: true,
  create: true,
  edit: true,
  delete: true,
  availability: true,
  bulkAvailability: true,
  usageResolution: true,
  batchUsageCounting: true,
  disableGuard: true,
  deleteGuard: true,
})

/**
 * Exhaustive capability matrix — every `VocabularyOptionSetId` must have an
 * explicit row. Runtime registries derive enabled subsets from this map.
 */
export const VOCABULARY_SET_CAPABILITIES = {
  'creature-types': enabledManagementCapabilities(),
  'damage-types': browseOnlyWithUsageResolutionCapabilities(),
  conditions: browseOnlyWithUsageResolutionCapabilities(),
  languages: browseOnlyWithUsageResolutionCapabilities(),
  senses: browseOnlyWithUsageResolutionCapabilities(),
  sizes: browseOnlyWithUsageResolutionCapabilities(),
  'spell-schools': browseOnlyWithUsageResolutionCapabilities(),
  'weapon-properties': browseOnlyWithUsageResolutionCapabilities(),
  'equipment-categories': browseOnlyWithUsageResolutionCapabilities(),
  'edition-presets': disabledCapabilities(),
  'attack-resolution-modes': disabledCapabilities(),
} as const satisfies Record<VocabularyOptionSetId, VocabularySetCapability>

export type VocabularySetCapabilityViolation = {
  field: keyof VocabularySetCapability | 'implication'
  message: string
}

/** Validates capability flag implications for one set. */
export function validateVocabularySetCapabilityImplications(
  capabilities: VocabularySetCapability,
): VocabularySetCapabilityViolation[] {
  const violations: VocabularySetCapabilityViolation[] = []

  const managementFields = [
    'create',
    'edit',
    'delete',
    'availability',
    'bulkAvailability',
    'usageResolution',
    'batchUsageCounting',
    'disableGuard',
    'deleteGuard',
  ] as const satisfies readonly (keyof VocabularySetCapability)[]

  for (const field of managementFields) {
    if (capabilities[field] && !capabilities.browse) {
      violations.push({
        field: 'implication',
        message: `${field} requires browse`,
      })
    }
  }

  if (capabilities.bulkAvailability && !capabilities.availability) {
    violations.push({
      field: 'implication',
      message: 'bulkAvailability requires availability',
    })
  }
  if (capabilities.delete && !capabilities.create) {
    violations.push({
      field: 'implication',
      message: 'delete requires create',
    })
  }
  if (capabilities.batchUsageCounting && !capabilities.usageResolution) {
    violations.push({
      field: 'implication',
      message: 'batchUsageCounting requires usageResolution',
    })
  }

  return violations
}

export function getVocabularySetCapability(setId: VocabularyOptionSetId): VocabularySetCapability {
  return VOCABULARY_SET_CAPABILITIES[setId]
}

/** Set ids listed on the Game Terms hub and reachable at overview/detail routes. */
export function vocabularySetIdsWithBrowse(
  capabilities: Record<
    VocabularyOptionSetId,
    VocabularySetCapability
  > = VOCABULARY_SET_CAPABILITIES,
): VocabularyOptionSetId[] {
  return VOCABULARY_OPTION_SET_IDS.filter((setId) => capabilities[setId].browse)
}

/** @deprecated Use {@link vocabularySetIdsWithBrowse}. */
export function vocabularySetIdsWithHubCard(
  capabilities: Record<
    VocabularyOptionSetId,
    VocabularySetCapability
  > = VOCABULARY_SET_CAPABILITIES,
): VocabularyOptionSetId[] {
  return vocabularySetIdsWithBrowse(capabilities)
}

/** @deprecated Use {@link vocabularySetIdsWithBrowse}. */
export function vocabularySetIdsWithOverview(
  capabilities: Record<
    VocabularyOptionSetId,
    VocabularySetCapability
  > = VOCABULARY_SET_CAPABILITIES,
): VocabularyOptionSetId[] {
  return vocabularySetIdsWithBrowse(capabilities)
}

/** Set ids that require a registered API usage/blocker resolver. */
export function vocabularySetIdsRequiringUsageResolver(
  capabilities: Record<
    VocabularyOptionSetId,
    VocabularySetCapability
  > = VOCABULARY_SET_CAPABILITIES,
): VocabularyOptionSetId[] {
  return VOCABULARY_OPTION_SET_IDS.filter(
    (setId) =>
      capabilities[setId].usageResolution ||
      capabilities[setId].disableGuard ||
      capabilities[setId].deleteGuard,
  )
}

/** Set ids that require a registered API batch count resolver for overview loads. */
export function vocabularySetIdsRequiringBatchCountResolver(
  capabilities: Record<
    VocabularyOptionSetId,
    VocabularySetCapability
  > = VOCABULARY_SET_CAPABILITIES,
): VocabularyOptionSetId[] {
  return VOCABULARY_OPTION_SET_IDS.filter((setId) => capabilities[setId].batchUsageCounting)
}

/** Set ids that require a dashboard entry form definition. */
export function vocabularySetIdsRequiringFormDefinition(
  capabilities: Record<
    VocabularyOptionSetId,
    VocabularySetCapability
  > = VOCABULARY_SET_CAPABILITIES,
): VocabularyOptionSetId[] {
  return VOCABULARY_OPTION_SET_IDS.filter(
    (setId) => capabilities[setId].create || capabilities[setId].edit,
  )
}
