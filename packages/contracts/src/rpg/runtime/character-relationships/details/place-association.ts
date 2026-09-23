import { z } from 'zod'

export const placeAssociationRelationshipDetailsSchema = z.object({}).strict()

export type PlaceAssociationRelationshipDetails = z.infer<
  typeof placeAssociationRelationshipDetailsSchema
>
