import mongoose, { type InferSchemaType, type Model } from 'mongoose'

import { CHARACTER_RELATIONSHIP_EDGE_KIND_IDS, CONTENT_VISIBILITY_MODES } from '@rpg/contracts'

const { model, models, Schema } = mongoose

const characterRelationshipSchema = new Schema(
  {
    _id: { type: String, required: true },
    campaignId: { type: String, required: true, index: true },
    revision: { type: Number, required: true, default: 1 },
    kind: { type: String, enum: [...CHARACTER_RELATIONSHIP_EDGE_KIND_IDS], required: true },
    characterId: { type: String, required: true, index: true },
    organizationId: { type: String, index: true },
    locationId: { type: String, index: true },
    relatedCharacterId: { type: String, index: true },
    canonicalEndpointsKey: { type: String, required: true },
    details: { type: Schema.Types.Mixed, default: () => ({}) },
    visibility: { type: String, enum: [...CONTENT_VISIBILITY_MODES], required: true },
    createdByUserId: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
)

characterRelationshipSchema.index(
  { campaignId: 1, kind: 1, canonicalEndpointsKey: 1 },
  { unique: true },
)

characterRelationshipSchema.index({ campaignId: 1, characterId: 1, kind: 1, _id: 1 })
characterRelationshipSchema.index({ campaignId: 1, relatedCharacterId: 1, kind: 1, _id: 1 })
characterRelationshipSchema.index({ campaignId: 1, locationId: 1, kind: 1, _id: 1 })
characterRelationshipSchema.index({ campaignId: 1, organizationId: 1, kind: 1, _id: 1 })

characterRelationshipSchema.index(
  { campaignId: 1, characterId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      kind: 'resides_at',
      'details.lifecycle': 'current',
      'details.isPrimary': true,
    },
  },
)

export type CharacterRelationshipDoc = InferSchemaType<typeof characterRelationshipSchema> & {
  _id: string
  createdAt: Date
  updatedAt: Date
}

export const CharacterRelationshipModel: Model<CharacterRelationshipDoc> =
  (models.CharacterRelationship as Model<CharacterRelationshipDoc>) ??
  model<CharacterRelationshipDoc>('CharacterRelationship', characterRelationshipSchema)
