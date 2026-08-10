import { z } from 'zod'

import { characterLocationConnectionsSchema } from './location-connection'

/** Character ↔ organization membership. Untitled when `title` is absent. */
export const characterOrganizationConnectionSchema = z.object({
  organizationId: z.string().min(1),
  /** Descriptive membership title — never invent `'Member'` for an untitled membership. */
  title: z.string().trim().min(1).max(80).optional(),
  /**
   * Presentation/order precedence for roster sorting. Higher sorts first.
   * Distinct from authority — optional so legacy untitled/custom records stay valid.
   */
  priority: z.number().int().optional(),
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
          ctx.addIssue({
            code: 'custom',
            message: 'Organization memberships must be unique.',
            path: [index, 'organizationId'],
          })
        }
        seen.add(connection.organizationId)
      })
    }),
  locations: characterLocationConnectionsSchema,
})

export type CharacterConnections = z.infer<typeof characterConnectionsSchema>
