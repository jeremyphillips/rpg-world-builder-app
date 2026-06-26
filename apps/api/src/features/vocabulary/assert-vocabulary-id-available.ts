import { HttpError } from '../../lib/http-error'

interface VocabularyIdAvailabilityInput {
  /** Proposed vocabulary option id (slug shape). */
  id: string
  /** System ids from the ruleset seed set. */
  systemIds: ReadonlySet<string>
  /** Campaign-created ids already stored for this set. */
  campaignIds: ReadonlySet<string>
}

/**
 * Enforce vocabulary id uniqueness within a set. Campaign ids must not shadow
 * system seed ids; patch system entries instead of creating a duplicate id.
 */
export function assertVocabularyIdAvailable({
  id,
  systemIds,
  campaignIds,
}: VocabularyIdAvailabilityInput): void {
  if (systemIds.has(id)) {
    throw new HttpError(
      409,
      'id_conflict',
      `"${id}" is a system vocabulary id. Patch the system entry instead of creating a campaign entry with the same id.`,
    )
  }
  if (campaignIds.has(id)) {
    throw new HttpError(
      409,
      'id_conflict',
      `"${id}" is already used by a campaign vocabulary entry in this set.`,
    )
  }
}
