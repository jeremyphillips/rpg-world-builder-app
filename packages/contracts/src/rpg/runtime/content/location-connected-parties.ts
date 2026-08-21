import { z } from 'zod'

import { paginatedItemsSchema, type PaginatedItems } from '../../../lib/paginated-items'
import {
  CHARACTER_LOCATION_CONNECTION_FAMILY_IDS,
  characterLocationConnectionKindSchema,
  type CharacterLocationConnectionFamily,
} from '../../vocab/location/connection/character-location-connection'
import {
  ORGANIZATION_LOCATION_CONNECTION_FAMILY_IDS,
  organizationLocationConnectionKindSchema,
  type OrganizationLocationConnectionFamily,
} from '../../vocab/location/connection/organization-location-connection'
import { characterTypeSchema } from '../character/core'

export const LOCATION_CONNECTED_PARTY_SECTION_GROUP_IDS = [
  'territorial_authority',
  'people_and_organizations',
] as const

export type LocationConnectedPartySectionGroup =
  (typeof LOCATION_CONNECTED_PARTY_SECTION_GROUP_IDS)[number]

const locationConnectedPartySubjectBaseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
})

const locationConnectedPartyCharacterSubjectSchema = locationConnectedPartySubjectBaseSchema.extend(
  {
    type: z.literal('character'),
    characterType: characterTypeSchema,
  },
)

const locationConnectedPartyOrganizationSubjectSchema =
  locationConnectedPartySubjectBaseSchema.extend({
    type: z.literal('organization'),
  })

export const locationConnectedPartySubjectSchema = z.discriminatedUnion('type', [
  locationConnectedPartyCharacterSubjectSchema,
  locationConnectedPartyOrganizationSubjectSchema,
])

export type LocationConnectedPartySubject = z.infer<typeof locationConnectedPartySubjectSchema>

const locationConnectedPartyRowBaseSchema = z.object({
  relationshipId: z.string().min(1),
  label: z.string().min(1),
  priority: z.number(),
  sectionGroup: z.enum(LOCATION_CONNECTED_PARTY_SECTION_GROUP_IDS),
})

export const locationConnectedPartyRowSchema = z.discriminatedUnion('subjectType', [
  locationConnectedPartyRowBaseSchema.extend({
    subjectType: z.literal('organization'),
    subject: locationConnectedPartyOrganizationSubjectSchema,
    kind: organizationLocationConnectionKindSchema,
    family: z.enum(ORGANIZATION_LOCATION_CONNECTION_FAMILY_IDS),
  }),
  locationConnectedPartyRowBaseSchema.extend({
    subjectType: z.literal('character'),
    subject: locationConnectedPartyCharacterSubjectSchema,
    kind: characterLocationConnectionKindSchema,
    family: z.enum(CHARACTER_LOCATION_CONNECTION_FAMILY_IDS),
  }),
])

export type LocationConnectedPartyRow = z.infer<typeof locationConnectedPartyRowSchema>

export type LocationConnectedPartyOrganizationRow = Extract<
  LocationConnectedPartyRow,
  { subjectType: 'organization' }
>

export type LocationConnectedPartyCharacterRow = Extract<
  LocationConnectedPartyRow,
  { subjectType: 'character' }
>

export const locationConnectedPartiesResponseSchema = paginatedItemsSchema(
  locationConnectedPartyRowSchema,
)

export type LocationConnectedPartiesResponse = PaginatedItems<LocationConnectedPartyRow>

/** Maps a connection family to the location detail section group. */
export function resolveLocationConnectedPartySectionGroup(
  family: OrganizationLocationConnectionFamily | CharacterLocationConnectionFamily,
): LocationConnectedPartySectionGroup {
  return family === 'territorial_authority' ? 'territorial_authority' : 'people_and_organizations'
}

/** Section rank for deterministic merged ordering — territorial authority first. */
export function getLocationConnectedPartySectionRank(
  sectionGroup: LocationConnectedPartySectionGroup,
): number {
  return sectionGroup === 'territorial_authority' ? 0 : 1
}
