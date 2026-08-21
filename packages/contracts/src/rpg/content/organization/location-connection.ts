import { z } from 'zod'

import {
  getOrganizationLocationConnectionFamily,
  getOrganizationLocationConnectionMaxSubjectsPerOrganization,
  organizationLocationConnectionKindSchema,
  type OrganizationLocationConnectionKind,
} from '../../vocab/location/connection/organization-location-connection'
import {
  getOrganizationLocationConnectionFamilyExclusivity,
  organizationLocationConnectionFamilyViolationMessage,
} from '../lib/relationship/organization-location-connection-family-rules'

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
    const kindCounts = new Map<OrganizationLocationConnectionKind, number>()

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
      const familyExclusivity = getOrganizationLocationConnectionFamilyExclusivity(family)
      if (familyExclusivity === 'one_per_family') {
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

      kindCounts.set(connection.kind, (kindCounts.get(connection.kind) ?? 0) + 1)
    })

    for (const [kind, count] of kindCounts) {
      const maxSubjectsPerOrganization =
        getOrganizationLocationConnectionMaxSubjectsPerOrganization(kind)
      if (maxSubjectsPerOrganization !== null && count > maxSubjectsPerOrganization) {
        const indexes = connections
          .map((connection, index) => (connection.kind === kind ? index : -1))
          .filter((index) => index >= 0)
        for (const index of indexes) {
          ctx.addIssue({
            code: 'custom',
            message: `Each organization may have at most ${maxSubjectsPerOrganization} ${kind} connection(s).`,
            path: [index, 'kind'],
          })
        }
      }
    }
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
