import { z } from 'zod'

import { organizationLocationConnectionsSchema } from './organization-location-connection'

export const organizationConnectionsSchema = z.object({
  locations: organizationLocationConnectionsSchema,
})

export type OrganizationConnections = z.infer<typeof organizationConnectionsSchema>
