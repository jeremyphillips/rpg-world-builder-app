import { z } from 'zod'
import { addCustomRefinementIssue } from '../../../../lib/add-custom-refinement-issue'

import { characterLocationConnectionsSchema } from './location-connection'

/** Character ↔ organization membership. */
export const characterOrganizationConnectionSchema = z.object({
  organizationId: z.string().min(1),
  membershipTitleId: z.string().trim().min(1),
})

export type CharacterOrganizationConnection = z.infer<typeof characterOrganizationConnectionSchema>

export const characterConnectionsSchema = z.object({
  /** Memberships — unique by organizationId. */
  organizations: z
    .array(characterOrganizationConnectionSchema)
    .default([])
    .superRefine((connections, ctx) => {
      const seen = new Set<string>()
      connections.forEach((connection, index) => {
        if (seen.has(connection.organizationId)) {
          addCustomRefinementIssue(ctx, 'Organization memberships must be unique.', [
            index,
            'organizationId',
          ])
        }
        seen.add(connection.organizationId)
      })
    }),
  locations: characterLocationConnectionsSchema,
})

export type CharacterConnections = z.infer<typeof characterConnectionsSchema>
