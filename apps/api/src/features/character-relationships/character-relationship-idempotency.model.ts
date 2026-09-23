import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

const characterRelationshipIdempotencySchema = new Schema(
  {
    campaignId: { type: String, required: true },
    actorUserId: { type: String, required: true },
    commandType: { type: String, required: true },
    idempotencyKey: { type: String, required: true },
    requestHash: { type: String, required: true },
    relationshipId: { type: String, required: true },
  },
  { timestamps: true },
)

characterRelationshipIdempotencySchema.index(
  { campaignId: 1, actorUserId: 1, commandType: 1, idempotencyKey: 1 },
  { unique: true },
)

export type CharacterRelationshipIdempotencyDoc = InferSchemaType<
  typeof characterRelationshipIdempotencySchema
>

export const CharacterRelationshipIdempotencyModel: Model<CharacterRelationshipIdempotencyDoc> =
  (models.CharacterRelationshipIdempotency as Model<CharacterRelationshipIdempotencyDoc>) ??
  model<CharacterRelationshipIdempotencyDoc>(
    'CharacterRelationshipIdempotency',
    characterRelationshipIdempotencySchema,
  )
