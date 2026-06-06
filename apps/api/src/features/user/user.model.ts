import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

import { ROLES } from "@rpg/contracts";

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
    role: { type: String, enum: ROLES, required: true, default: "pc" },
  },
  { timestamps: true },
);

export type UserSchemaType = InferSchemaType<typeof userSchema>;

// Reuse an already-compiled model across hot reloads / repeated test imports.
export const UserModel: Model<UserSchemaType> =
  (models.User as Model<UserSchemaType>) ?? model<UserSchemaType>("User", userSchema);
