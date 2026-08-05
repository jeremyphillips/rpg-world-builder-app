import { z } from 'zod'

import {
  getOrganizationLocationConnectionFamily,
  organizationLocationConnectionKindSchema,
  type OrganizationLocationConnectionKind,
} from '../vocab/location/organization-location-connection'
import {
  getOrganizationLocationConnectionFamilyCardinality,
  organizationLocationConnectionFamilyViolationMessage,
} from './lib/organization-location-connection-family-rules'

export const organizationLocationConnectionSchema = z.object({
  id: z.string().min(1),
  locationId: z.string().min(1),
  kind: organizationLocationConnectionKindSchema,
})

export type OrganizationLocationConnection = z.infer<typeof organizationLocationConnectionSchema>

export const organizationLocationConnectionsSchema = z
  .array(organizationLocationConnectionSchema)
  .default([])
  .superRefine((connections, ctx) => {
    const seenIds = new Set<string>()
    const seenLocationKinds = new Set<string>()
    const seenLocationFamilies = new Set<string>()

    connections.forEach((connection, index) => {
      if (seenIds.has(connection.id)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Location connection ids must be unique within the organization.',
          path: [index, 'id'],
        })
      }
      seenIds.add(connection.id)

      const locationKindKey = `${connection.locationId}:${connection.kind}`
      if (seenLocationKinds.has(locationKindKey)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Each location may appear at most once per connection kind.',
          path: [index, 'kind'],
        })
      }
      seenLocationKinds.add(locationKindKey)

      const family = getOrganizationLocationConnectionFamily(connection.kind)
      if (getOrganizationLocationConnectionFamilyCardinality(family) === 'one_per_family') {
        const locationFamilyKey = `${connection.locationId}:${family}`
        if (seenLocationFamilies.has(locationFamilyKey)) {
          ctx.addIssue({
            code: 'custom',
            message: organizationLocationConnectionFamilyViolationMessage(family),
            path: [index, 'kind'],
          })
        }
        seenLocationFamilies.add(locationFamilyKey)
      }
    })
  })

export type OrganizationLocationConnections = z.infer<typeof organizationLocationConnectionsSchema>

/** Builds a persisted organization location connection row from authoring input. */
export function buildOrganizationLocationConnection(input: {
  id: string
  locationId: string
  kind: OrganizationLocationConnectionKind
}): OrganizationLocationConnection {
  return {
    id: input.id,
    locationId: input.locationId,
    kind: input.kind,
  }
}

/** Body for nested POST …/location-connections. */
export const createOrganizationLocationConnectionInputSchema = z.object({
  id: z.string().min(1).optional(),
  locationId: z.string().min(1),
  kind: organizationLocationConnectionKindSchema,
})

export type CreateOrganizationLocationConnectionInput = z.infer<
  typeof createOrganizationLocationConnectionInputSchema
>

/** Body for nested PATCH …/location-connections/:connectionId. */
export const updateOrganizationLocationConnectionInputSchema = z
  .object({
    locationId: z.string().min(1).optional(),
    kind: organizationLocationConnectionKindSchema.optional(),
  })
  .refine((value) => value.locationId !== undefined || value.kind !== undefined, {
    message: 'At least one of locationId or kind is required.',
  })

export type UpdateOrganizationLocationConnectionInput = z.infer<
  typeof updateOrganizationLocationConnectionInputSchema
>

export const organizationLocationConnectionMutationSchema = organizationLocationConnectionSchema
