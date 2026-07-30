import { HttpError } from '../../../lib/http-error'

interface VocabularyIdAvailabilityInput {
  /** Proposed vocabulary option id (slug shape). */
  id: string
  /** All ids already present in the resolved set — reserved regardless of status or source. */
  reservedIds: ReadonlySet<string>
}

/**
 * Enforce vocabulary id uniqueness within a set. Ids remain reserved when disabled
 * or sourced from system seed; only delete removes campaign rows from the active list.
 */
export function assertVocabularyIdAvailable({
  id,
  reservedIds,
}: VocabularyIdAvailabilityInput): void {
  if (reservedIds.has(id)) {
    throw new HttpError(
      409,
      'id_conflict',
      `"${id}" is already used by a vocabulary entry in this set.`,
    )
  }
}
