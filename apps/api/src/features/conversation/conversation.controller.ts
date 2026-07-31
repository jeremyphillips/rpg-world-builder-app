import type { Request, Response } from 'express'
import { isValidObjectId } from 'mongoose'

import {
  conversationListQuerySchema,
  createDirectConversationInputSchema,
  directConversationRecipientsQuerySchema,
  markConversationReadInputSchema,
  messageListQuerySchema,
  sendDirectMessageInputSchema,
} from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import {
  createDirectConversation,
  getDirectMessageRecipients,
  listConversationMessages,
  listConversations,
  markConversationRead,
  sendConversationMessage,
} from './conversation.service'

export async function listRecipients(req: Request, res: Response): Promise<void> {
  const parsed = directConversationRecipientsQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    throw HttpError.badRequest('Validation failed', {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  const result = await getDirectMessageRecipients(req.user!.id, {
    campaignId: parsed.data.campaignId,
  })
  res.status(200).json(result)
}

export async function createDirect(req: Request, res: Response): Promise<void> {
  const parsed = createDirectConversationInputSchema.safeParse(req.body)
  if (!parsed.success) {
    throw HttpError.badRequest('Validation failed', {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  const conversation = await createDirectConversation(req.user!.id, parsed.data.recipientUserId)
  res.status(201).json({ conversation })
}

export async function list(req: Request, res: Response): Promise<void> {
  const parsed = conversationListQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    throw HttpError.badRequest('Validation failed', {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  const result = await listConversations(req.user!.id, {
    limit: parsed.data.limit,
    cursor: parsed.data.cursor,
    campaignId: parsed.data.campaignId,
  })
  res.status(200).json(result)
}

export async function listMessages(req: Request, res: Response): Promise<void> {
  const conversationId = String(req.params.conversationId)
  if (!isValidObjectId(conversationId)) {
    throw new HttpError(404, 'not_found', 'Conversation not found.')
  }

  const parsed = messageListQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    throw HttpError.badRequest('Validation failed', {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  const result = await listConversationMessages(req.user!.id, conversationId, {
    limit: parsed.data.limit,
    cursor: parsed.data.cursor,
  })

  res.status(200).json(result)
}

export async function sendMessage(req: Request, res: Response): Promise<void> {
  const conversationId = String(req.params.conversationId)
  if (!isValidObjectId(conversationId)) {
    throw new HttpError(404, 'not_found', 'Conversation not found.')
  }

  const parsed = sendDirectMessageInputSchema.safeParse(req.body)
  if (!parsed.success) {
    throw HttpError.badRequest('Validation failed', {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  const message = await sendConversationMessage(req.user!.id, conversationId, parsed.data)
  res.status(201).json({ message })
}

export async function markRead(req: Request, res: Response): Promise<void> {
  const conversationId = String(req.params.conversationId)
  if (!isValidObjectId(conversationId)) {
    throw new HttpError(404, 'not_found', 'Conversation not found.')
  }

  const parsed = markConversationReadInputSchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    throw HttpError.badRequest('Validation failed', {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  const conversation = await markConversationRead(
    req.user!.id,
    conversationId,
    parsed.data.lastReadMessageId,
  )
  res.status(200).json({ conversation })
}
