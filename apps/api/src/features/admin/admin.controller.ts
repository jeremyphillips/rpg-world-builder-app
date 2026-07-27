import type { Request, Response } from 'express'
import { adminUsersListQuerySchema } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { findUserWithActivityTimestampsById } from '../user'
import { deleteAdminUser, getAdminUserDeletionPreview } from './admin-user-delete.service'
import { listAdminUsers } from './admin-user-list.service'

export async function listUsers(req: Request, res: Response): Promise<void> {
  const parsed = adminUsersListQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    throw HttpError.badRequest('Validation failed', {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  const result = await listAdminUsers(parsed.data, {
    id: req.user!.id,
    role: req.user!.role,
  })
  res.status(200).json(result)
}

export async function deletionPreview(req: Request, res: Response): Promise<void> {
  const { userId } = req.params as { userId: string }
  const targetUser = await findUserWithActivityTimestampsById(userId)
  if (!targetUser) {
    throw new HttpError(404, 'not_found', 'User not found.')
  }

  const preview = await getAdminUserDeletionPreview(targetUser, {
    id: req.user!.id,
    role: req.user!.role,
  })

  res.status(200).json({ preview })
}

export async function removeUser(req: Request, res: Response): Promise<void> {
  const { userId } = req.params as { userId: string }
  const targetUser = await findUserWithActivityTimestampsById(userId)
  if (!targetUser) {
    throw new HttpError(404, 'not_found', 'User not found.')
  }

  const result = await deleteAdminUser(targetUser, {
    id: req.user!.id,
    role: req.user!.role,
  })

  if (!result.deleted) {
    throw new HttpError(409, 'conflict', 'User cannot be deleted.', {
      blockers: result.blockers,
    })
  }

  res.status(204).send()
}
