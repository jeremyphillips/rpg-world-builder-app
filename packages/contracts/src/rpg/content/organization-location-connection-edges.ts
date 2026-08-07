import { z } from 'zod'

import { organizationLocationConnectionKindSchema } from '../vocab/location/organization-location-connection'

export const organizationLocationConnectionEdgeAtLocationSchema = z.object({
  organizationId: z.string(),
  connectionId: z.string(),
  locationId: z.string(),
  kind: organizationLocationConnectionKindSchema,
  subjectName: z.string().optional(),
})

export type OrganizationLocationConnectionEdgeAtLocationDto = z.infer<
  typeof organizationLocationConnectionEdgeAtLocationSchema
>

export const campaignOrganizationLocationConnectionEdgesSchema = z.object({
  edgesByLocationId: z.record(
    z.string(),
    z.array(organizationLocationConnectionEdgeAtLocationSchema),
  ),
})

export type CampaignOrganizationLocationConnectionEdges = z.infer<
  typeof campaignOrganizationLocationConnectionEdgesSchema
>
