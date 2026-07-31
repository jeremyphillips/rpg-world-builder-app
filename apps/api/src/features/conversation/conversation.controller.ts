import type { Request, Response } from 'express'
import { isValidObjectId } from 'mongoose'

import {
  conversationListQuerySchema,
  directConversationRecipientsQuerySchema,
  markConversationReadInputSchema,
  messageListQuerySchema,
  sendDirectMessageInputSchema,
  sendFirstDirectMessageInputSchema,
} from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import {
  getDirectMessageRecipients,
  getConversation,
  listConversationMessages,
  listConversations,
  markConversationRead,
  sendConversationMessage,
  sendFirstDirectMessage,
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

export async function sendFirstDirect(req: Request, res: Response): Promise<void> {
  const parsed = sendFirstDirectMessageInputSchema.safeParse(req.body)
  if (!parsed.success) {
    throw HttpError.badRequest('Validation failed', {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  const result = await sendFirstDirectMessage(req.user!.id, parsed.data)
  res.status(201).json(result)
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

export async function getOne(req: Request, res: Response): Promise<void> {
  const conversationId = String(req.params.conversationId)
  if (!isValidObjectId(conversationId)) {
    throw new HttpError(404, 'not_found', 'Conversation not found.')
  }

  const conversation = await getConversation(req.user!.id, conversationId)
  res.status(200).json({ conversation })
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
