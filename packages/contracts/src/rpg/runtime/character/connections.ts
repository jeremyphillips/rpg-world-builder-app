import { z } from 'zod'

export const characterOrganizationConnectionSchema = z.object({
  organizationId: z.string().min(1),
})

export type CharacterOrganizationConnection = z.infer<typeof characterOrganizationConnectionSchema>

export const characterConnectionsSchema = z.object({
  organizations: z
    .array(characterOrganizationConnectionSchema)
    .default([])
    .superRefine((connections, ctx) => {
      const seen = new Set<string>()
      connections.forEach((connection, index) => {
        if (seen.has(connection.organizationId)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Organization connections must be unique.',
            path: [index, 'organizationId'],
          })
        }
        seen.add(connection.organizationId)
      })
    }),
})

export type CharacterConnections = z.infer<typeof characterConnectionsSchema>
