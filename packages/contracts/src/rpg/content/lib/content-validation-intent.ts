import type { ContentStatus } from './envelope'

/** Wire-level validation mode for content authoring — distinct from persisted `ContentStatus`. */
export const CONTENT_VALIDATION_INTENTS = ['draft', 'publish'] as const

export type ContentValidationIntent = (typeof CONTENT_VALIDATION_INTENTS)[number]

/** Maps persisted lifecycle status to the validation family used on save. */
export function contentStatusToValidationIntent(status: ContentStatus): ContentValidationIntent {
  return status === 'draft' ? 'draft' : 'publish'
}
