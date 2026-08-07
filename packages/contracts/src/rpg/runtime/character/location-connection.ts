import { z } from 'zod'

import {
  characterLocationConnectionKindSchema,
  type CharacterLocationConnectionKind,
} from '../../vocab/location/character-location-connection'

export const characterLocationConnectionSchema = z.object({
  id: z.string().min(1),
  locationId: z.string().min(1),
  kind: characterLocationConnectionKindSchema,
})

export type CharacterLocationConnection = z.infer<typeof characterLocationConnectionSchema>

export const characterLocationConnectionsSchema = z
  .array(characterLocationConnectionSchema)
  .default([])
  .superRefine((connections, ctx) => {
    const seenIds = new Set<string>()
    const seenLocationKinds = new Set<string>()

    connections.forEach((connection, index) => {
      if (seenIds.has(connection.id)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Location connection ids must be unique within the character.',
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
    })
  })

export type CharacterLocationConnections = z.infer<typeof characterLocationConnectionsSchema>

/** Builds a persisted character location connection row from authoring input. */
export function buildCharacterLocationConnection(input: {
  id: string
  locationId: string
  kind: CharacterLocationConnectionKind
}): CharacterLocationConnection {
  return {
    id: input.id,
    locationId: input.locationId,
    kind: input.kind,
  }
}

/** Body for nested POST …/location-connections. */
export const createCharacterLocationConnectionInputSchema = z.object({
  id: z.string().min(1).optional(),
  locationId: z.string().min(1),
  kind: characterLocationConnectionKindSchema,
})

export type CreateCharacterLocationConnectionInput = z.infer<
  typeof createCharacterLocationConnectionInputSchema
>

/** Body for nested PATCH …/location-connections/:connectionId. */
export const updateCharacterLocationConnectionInputSchema = z
  .object({
    locationId: z.string().min(1).optional(),
    kind: characterLocationConnectionKindSchema.optional(),
  })
  .refine((value) => value.locationId !== undefined || value.kind !== undefined, {
    message: 'At least one of locationId or kind is required.',
  })

export type UpdateCharacterLocationConnectionInput = z.infer<
  typeof updateCharacterLocationConnectionInputSchema
>

export const characterLocationConnectionMutationSchema = characterLocationConnectionSchema
