import { z } from 'zod'

import { paginatedItemsSchema, type PaginatedItems } from '../../../lib/paginated-items'

export const organizationConnectedRegionRelationshipFamilySchema = z.enum([
  'territorialAuthority',
  'partyAssociation',
])

export type OrganizationConnectedRegionRelationshipFamily = z.infer<
  typeof organizationConnectedRegionRelationshipFamilySchema
>

/** A region linked to an organization via territorial authority or party association. */
export const organizationConnectedRegionSummarySchema = z.object({
  relationshipFamily: organizationConnectedRegionRelationshipFamilySchema,
  relationshipKind: z.string().min(1),
  relationshipLabel: z.string().min(1),
  region: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    slug: z.string().min(1),
  }),
})

export type OrganizationConnectedRegionSummary = z.infer<
  typeof organizationConnectedRegionSummarySchema
>

export const organizationConnectedRegionsResponseSchema = paginatedItemsSchema(
  organizationConnectedRegionSummarySchema,
)

/** Organization detail reverse region read — family-labeled rows, no cross-family merge. */
export type OrganizationConnectedRegionsResponse =
  PaginatedItems<OrganizationConnectedRegionSummary>
