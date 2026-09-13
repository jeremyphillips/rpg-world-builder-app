import type { ContentDeletionAvailability, Species } from '@rpg/contracts'
import { ApiError, contentDeletionAvailabilitySchema, fetchCsrfToken } from '@rpg/contracts'

import { CSRF_HEADER } from '@/lib/api-client'
import { formatContentListLoadErrorMessage } from '../../lib/content-type-labels'
import { createContentListApi } from '../../lib/list/create-content-list'

/** List all species (system + homebrew) available in a campaign's ruleset. */
export const listSpecies = createContentListApi<Species>({
  routeKey: 'species',
  responseKey: 'species',
  errorMessage: formatContentListLoadErrorMessage('species'),
})

/** GET `/api/campaigns/:campaignId/content/species/:entityId/heritage-removal-availability`. */
export async function fetchSpeciesHeritageRemovalAvailability(
  campaignId: string,
  entityId: string,
): Promise<ContentDeletionAvailability> {
  const csrfToken = await fetchCsrfToken()
  const res = await fetch(
    `/api/campaigns/${campaignId}/content/species/${entityId}/heritage-removal-availability`,
    {
      credentials: 'include',
      headers: { [CSRF_HEADER]: csrfToken },
    },
  )
  const body = (await res.json().catch(() => null)) as {
    availability?: unknown
    error?: { code?: string; message?: string }
  } | null
  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.error?.code ?? 'request_error',
      body?.error?.message ?? 'Could not check whether heritage can be removed.',
    )
  }
  return contentDeletionAvailabilitySchema.parse(body?.availability)
}
