import type { Request, Response } from 'express'
import { isValidObjectId } from 'mongoose'

import type { MarkNotificationsSeenInput } from '@rpg/contracts'
import {
  markNotificationReadParamsSchema,
  notificationListQuerySchema,
  notificationUnreadCountResponseSchema,
} from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationsSeen,
} from './notification.service'
import { decodeNotificationCursor } from './notification.repository'

export async function list(req: Request, res: Response): Promise<void> {
  const recipientUserId = req.user!.id
  const parsed = notificationListQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    throw HttpError.badRequest('Validation failed', {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  if (parsed.data.cursor) {
    const decodedCursor = decodeNotificationCursor(parsed.data.cursor)
    if (!decodedCursor || !isValidObjectId(decodedCursor.id)) {
      throw HttpError.badRequest('Validation failed', {
        issues: [{ path: 'cursor', message: 'Invalid cursor.' }],
      })
    }
  }

  const result = await listNotifications(recipientUserId, {
    limit: parsed.data.limit,
    cursor: parsed.data.cursor,
  })
  res.status(200).json(result)
}

export async function unreadCount(req: Request, res: Response): Promise<void> {
  const recipientUserId = req.user!.id
  const unreadCount = await getUnreadNotificationCount(recipientUserId)
  const response = notificationUnreadCountResponseSchema.parse({ unreadCount })
  res.status(200).json(response)
}

export async function markRead(req: Request, res: Response): Promise<void> {
  const recipientUserId = req.user!.id
  const parsed = markNotificationReadParamsSchema.safeParse(req.params)
  if (!parsed.success) {
    throw HttpError.badRequest('Validation failed', {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  const notification = await markNotificationRead({
    recipientUserId,
    notificationId: parsed.data.notificationId,
  })
  if (!notification) {
    throw new HttpError(404, 'not_found', 'Notification not found.')
  }
  res.status(200).json({ notification })
}

export async function markAllRead(req: Request, res: Response): Promise<void> {
  const recipientUserId = req.user!.id
  const updatedCount = await markAllNotificationsRead(recipientUserId)
  res.status(200).json({ updatedCount })
}

export async function markSeen(req: Request, res: Response): Promise<void> {
  const recipientUserId = req.user!.id
  const { ids } = req.body as MarkNotificationsSeenInput
  const updatedCount = await markNotificationsSeen({ recipientUserId, ids })
  res.status(200).json({ updatedCount })
}
