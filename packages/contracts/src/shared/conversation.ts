import { z } from 'zod'

import {
  DIRECT_MESSAGE_PREVIEW_MAX_LENGTH,
  directMessageSchema,
  sendDirectMessageInputSchema,
} from './direct-message'

/** Direct-only today; reserve `campaign` for future campaign-channel conversations. */
export const CONVERSATION_KINDS = ['direct'] as const

export const conversationKindSchema = z.enum(CONVERSATION_KINDS)

export type ConversationKind = z.infer<typeof conversationKindSchema>

export const conversationPeerSchema = z.object({
  userId: z.string(),
  displayName: z.string(),
})

export type ConversationPeer = z.infer<typeof conversationPeerSchema>

export const conversationLatestMessageSchema = z.object({
  messageId: z.string(),
  senderUserId: z.string(),
  preview: z.string().max(DIRECT_MESSAGE_PREVIEW_MAX_LENGTH),
  createdAt: z.iso.datetime(),
})

export type ConversationLatestMessage = z.infer<typeof conversationLatestMessageSchema>

export const conversationSharedCampaignSchema = z.object({
  campaignId: z.string(),
  campaignName: z.string(),
})

export type ConversationSharedCampaign = z.infer<typeof conversationSharedCampaignSchema>

export const conversationSchema = z.object({
  id: z.string(),
  kind: conversationKindSchema,
  participantUserIds: z.tuple([z.string(), z.string()]),
  peer: conversationPeerSchema,
  /** Resolved live on list/detail — not persisted. Viewer-visible shared campaigns only. */
  sharedCampaigns: z.array(conversationSharedCampaignSchema),
  latestMessage: conversationLatestMessageSchema.optional(),
  unreadCount: z.number().int().nonnegative(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  /** Monotonic per-participant projection revision for HTTP/socket cache guards. */
  version: z.number().int().positive(),
})

export type Conversation = z.infer<typeof conversationSchema>

export const conversationListItemSchema = conversationSchema

export type ConversationListItem = z.infer<typeof conversationListItemSchema>

export const createDirectConversationInputSchema = z.object({
  recipientUserId: z.string(),
})

export type CreateDirectConversationInput = z.infer<typeof createDirectConversationInputSchema>

export const directConversationRecipientSchema = conversationPeerSchema

export type DirectConversationRecipient = z.infer<typeof directConversationRecipientSchema>

export const directConversationRecipientCampaignGroupSchema = z.object({
  campaignId: z.string(),
  campaignName: z.string(),
  userIds: z.array(z.string()),
})

export type DirectConversationRecipientCampaignGroup = z.infer<
  typeof directConversationRecipientCampaignGroupSchema
>

export const directConversationRecipientsResponseSchema = z.object({
  recipientsByUserId: z.record(z.string(), directConversationRecipientSchema),
  campaigns: z.array(directConversationRecipientCampaignGroupSchema),
  existingDirectByUserId: z.record(z.string(), z.string()),
})

export type DirectConversationRecipientsResponse = z.infer<
  typeof directConversationRecipientsResponseSchema
>

export const conversationListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().trim().optional(),
})

export type ConversationListQuery = z.infer<typeof conversationListQuerySchema>

export const conversationListResponseSchema = z.object({
  items: z.array(conversationListItemSchema),
  nextCursor: z.string().nullable(),
})

export type ConversationListResponse = z.infer<typeof conversationListResponseSchema>

export const messageListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().trim().optional(),
})

export type MessageListQuery = z.infer<typeof messageListQuerySchema>

export const messageListResponseSchema = z.object({
  items: z.array(directMessageSchema),
  nextCursor: z.string().nullable(),
})

export type MessageListResponse = z.infer<typeof messageListResponseSchema>

export const markConversationReadInputSchema = z.object({
  lastReadMessageId: z.string().optional(),
})

export type MarkConversationReadInput = z.infer<typeof markConversationReadInputSchema>

export const markConversationReadResponseSchema = z.object({
  conversation: conversationSchema,
})

export type MarkConversationReadResponse = z.infer<typeof markConversationReadResponseSchema>

export const sendDirectMessageResponseSchema = z.object({
  message: directMessageSchema,
})

export type SendDirectMessageResponse = z.infer<typeof sendDirectMessageResponseSchema>

export { sendDirectMessageInputSchema }
