import mongoose, { type InferSchemaType, type Model } from 'mongoose'

// Mongoose is CommonJS; under ESM, Node's static export analysis doesn't expose
// some bindings (e.g. `models`) as named exports, so destructure from default.
const { model, models, Schema } = mongoose

import { PLATFORM_ROLES } from '@rpg/contracts'

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: true, trim: true },
    role: { type: String, enum: PLATFORM_ROLES, required: true, default: 'user' },
  },
  { timestamps: true },
)

export type UserSchemaType = InferSchemaType<typeof userSchema>

// Reuse an already-compiled model across hot reloads / repeated test imports.
export const UserModel: Model<UserSchemaType> =
  (models.User as Model<UserSchemaType>) ?? model<UserSchemaType>('User', userSchema)
