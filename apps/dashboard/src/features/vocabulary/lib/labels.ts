import type { VocabularyOptionSource, VocabularyOptionStatus } from '@rpg/contracts'

import type { SourceBadgeMap } from '@/lib/data-table/column-builders'

/** UI labels for vocabulary option sources — `campaign` renders as Custom. */
export const VOCABULARY_SOURCE_LABELS = {
  system: 'System',
  campaign: 'Custom',
} as const satisfies Record<VocabularyOptionSource, string>

export const VOCABULARY_SOURCE_BADGE = {
  system: {
    appearance: 'soft',
    tone: 'neutral',
    label: VOCABULARY_SOURCE_LABELS.system,
  },
  campaign: {
    appearance: 'outline',
    tone: 'neutral',
    label: VOCABULARY_SOURCE_LABELS.campaign,
  },
} as const satisfies SourceBadgeMap<VocabularyOptionSource>

export const VOCABULARY_STATUS_LABELS = {
  active: 'Active',
  disabled: 'Disabled',
} as const satisfies Record<VocabularyOptionStatus, string>

export function getVocabularySourceLabel(source: VocabularyOptionSource): string {
  return VOCABULARY_SOURCE_LABELS[source]
}

export function getVocabularyStatusLabel(status: VocabularyOptionStatus): string {
  return VOCABULARY_STATUS_LABELS[status]
}

export const UNKNOWN_VOCABULARY_SET_MESSAGE = 'Unknown vocabulary set.'
