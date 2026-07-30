import type { VocabularyOptionSetId } from './vocabulary'
import { VOCABULARY_OPTION_SET_IDS } from './vocabulary'

/** Product capabilities for a campaign vocabulary option set. */
export type VocabularySetCapability = {
  /** Homebrew hub card. */
  hubCard: boolean
  /** Full overview manager (table, filters, row actions). Implies hubCard. */
  overview: boolean
  create: boolean
  edit: boolean
  /** Delete campaign-sourced entries. Implies create. */
  delete: boolean
  /** Maps to status active/disabled in UI and PATCH. */
  availability: boolean
  bulkAvailability: boolean
  /** Attach usedBy to resolved options. */
  usageCounting: boolean
  /** Overview loads may use a set-level count batch resolver (counts only). */
  batchUsageCounting: boolean
  /** Block status → disabled when referenced (preflight + PATCH 409). */
  disableGuard: boolean
  /** Block DELETE when referenced. */
  deleteGuard: boolean
}

const disabledCapabilities = (): VocabularySetCapability => ({
  hubCard: false,
  overview: false,
  create: false,
  edit: false,
  delete: false,
  availability: false,
  bulkAvailability: false,
  usageCounting: false,
  batchUsageCounting: false,
  disableGuard: false,
  deleteGuard: false,
})

const enabledOverviewCapabilities = (): VocabularySetCapability => ({
  hubCard: true,
  overview: true,
  create: true,
  edit: true,
  delete: true,
  availability: true,
  bulkAvailability: true,
  usageCounting: true,
  batchUsageCounting: true,
  disableGuard: true,
  deleteGuard: true,
})

/**
 * Exhaustive capability matrix — every `VocabularyOptionSetId` must have an
 * explicit row. Runtime registries derive enabled subsets from this map.
 */
export const VOCABULARY_SET_CAPABILITIES = {
  'creature-types': enabledOverviewCapabilities(),
  'damage-types': disabledCapabilities(),
  conditions: disabledCapabilities(),
  languages: disabledCapabilities(),
  senses: disabledCapabilities(),
  sizes: disabledCapabilities(),
  'spell-schools': disabledCapabilities(),
  'weapon-properties': disabledCapabilities(),
  'equipment-categories': disabledCapabilities(),
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

  if (capabilities.bulkAvailability && !capabilities.availability) {
    violations.push({
      field: 'implication',
      message: 'bulkAvailability requires availability',
    })
  }
  if (capabilities.availability && !capabilities.overview) {
    violations.push({
      field: 'implication',
      message: 'availability requires overview',
    })
  }
  if (capabilities.overview && !capabilities.hubCard) {
    violations.push({
      field: 'implication',
      message: 'overview requires hubCard',
    })
  }
  if (capabilities.delete && !capabilities.create) {
    violations.push({
      field: 'implication',
      message: 'delete requires create',
    })
  }
  if (capabilities.batchUsageCounting && !capabilities.usageCounting) {
    violations.push({
      field: 'implication',
      message: 'batchUsageCounting requires usageCounting',
    })
  }

  return violations
}

export function getVocabularySetCapability(setId: VocabularyOptionSetId): VocabularySetCapability {
  return VOCABULARY_SET_CAPABILITIES[setId]
}

/** Set ids with a homebrew hub card. */
export function vocabularySetIdsWithHubCard(
  capabilities: Record<
    VocabularyOptionSetId,
    VocabularySetCapability
  > = VOCABULARY_SET_CAPABILITIES,
): VocabularyOptionSetId[] {
  return VOCABULARY_OPTION_SET_IDS.filter((setId) => capabilities[setId].hubCard)
}

/** Set ids with a full overview manager. */
export function vocabularySetIdsWithOverview(
  capabilities: Record<
    VocabularyOptionSetId,
    VocabularySetCapability
  > = VOCABULARY_SET_CAPABILITIES,
): VocabularyOptionSetId[] {
  return VOCABULARY_OPTION_SET_IDS.filter((setId) => capabilities[setId].overview)
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
      capabilities[setId].usageCounting ||
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
