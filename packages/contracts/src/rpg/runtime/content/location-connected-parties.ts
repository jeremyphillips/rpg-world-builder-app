import { z } from 'zod'

import { paginatedItemsSchema, type PaginatedItems } from '../../../lib/paginated-items'

export const LOCATION_CONNECTED_PARTY_SECTION_GROUP_IDS = [
  'territorial_authority',
  'people_and_organizations',
] as const

export type LocationConnectedPartySectionGroup =
  (typeof LOCATION_CONNECTED_PARTY_SECTION_GROUP_IDS)[number]

export const locationConnectedPartySubjectSchema = z.object({
  type: z.enum(['character', 'organization']),
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
})

export type LocationConnectedPartySubject = z.infer<typeof locationConnectedPartySubjectSchema>

export const locationConnectedPartyRowSchema = z.object({
  relationshipId: z.string().min(1),
  subject: locationConnectedPartySubjectSchema,
  kind: z.string().min(1),
  label: z.string().min(1),
  family: z.string().min(1),
  priority: z.number(),
  sectionGroup: z.enum(LOCATION_CONNECTED_PARTY_SECTION_GROUP_IDS),
})

export type LocationConnectedPartyRow = z.infer<typeof locationConnectedPartyRowSchema>

export const locationConnectedPartiesResponseSchema = paginatedItemsSchema(
  locationConnectedPartyRowSchema,
)

export type LocationConnectedPartiesResponse = PaginatedItems<LocationConnectedPartyRow>

/** Maps a connection family to the location detail section group. */
export function resolveLocationConnectedPartySectionGroup(
  family: string,
): LocationConnectedPartySectionGroup {
  return family === 'territorial_authority' ? 'territorial_authority' : 'people_and_organizations'
}

/** Section rank for deterministic merged ordering — territorial authority first. */
export function getLocationConnectedPartySectionRank(
  sectionGroup: LocationConnectedPartySectionGroup,
): number {
  return sectionGroup === 'territorial_authority' ? 0 : 1
}
