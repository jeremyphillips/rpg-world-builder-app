import { z } from 'zod'

export const DIRECT_MESSAGE_TEXT_MAX_LENGTH = 4000
export const DIRECT_MESSAGE_PREVIEW_MAX_LENGTH = 120

export const directMessageContentSchema = z.object({
  kind: z.literal('text'),
  text: z.string().trim().min(1).max(DIRECT_MESSAGE_TEXT_MAX_LENGTH),
})

export type DirectMessageContent = z.infer<typeof directMessageContentSchema>

export const directMessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderUserId: z.string(),
  content: directMessageContentSchema,
  clientMessageId: z.string().optional(),
  editedAt: z.iso.datetime().nullable().optional(),
  deletedAt: z.iso.datetime().nullable().optional(),
  createdAt: z.iso.datetime(),
})

export type DirectMessage = z.infer<typeof directMessageSchema>

export const sendDirectMessageInputSchema = z.object({
  content: directMessageContentSchema,
  clientMessageId: z.string().trim().min(1).optional(),
})

export type SendDirectMessageInput = z.infer<typeof sendDirectMessageInputSchema>
