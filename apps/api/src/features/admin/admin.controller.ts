import type { Request, Response } from 'express'
import {
  adminUserCampaignListQuerySchema,
  adminUserCharacterListQuerySchema,
  adminUsersListQuerySchema,
} from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { findUserWithActivityTimestampsById } from '../user'
import { deleteAdminUser, getAdminUserDeletionPreview } from './admin-user-delete.service'
import { listAdminUserCampaigns } from './admin-user-campaign-list.service'
import { listAdminUserCharacters } from './admin-user-character-list.service'
import { getAdminUserDetail } from './admin-user-detail.service'
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

export async function getUser(req: Request, res: Response): Promise<void> {
  const { userId } = req.params as { userId: string }
  const user = await getAdminUserDetail(userId, {
    id: req.user!.id,
    role: req.user!.role,
  })

  if (!user) {
    throw new HttpError(404, 'not_found', 'User not found.')
  }

  res.status(200).json({ user })
}

export async function listUserCampaigns(req: Request, res: Response): Promise<void> {
  const { userId } = req.params as { userId: string }
  const targetUser = await findUserWithActivityTimestampsById(userId)
  if (!targetUser) {
    throw new HttpError(404, 'not_found', 'User not found.')
  }

  const parsed = adminUserCampaignListQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    throw HttpError.badRequest('Validation failed', {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  const campaigns = await listAdminUserCampaigns(userId, parsed.data)
  res.status(200).json({ campaigns })
}

export async function listUserCharacters(req: Request, res: Response): Promise<void> {
  const { userId } = req.params as { userId: string }
  const targetUser = await findUserWithActivityTimestampsById(userId)
  if (!targetUser) {
    throw new HttpError(404, 'not_found', 'User not found.')
  }

  const parsed = adminUserCharacterListQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    throw HttpError.badRequest('Validation failed', {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  const characters = await listAdminUserCharacters(userId, parsed.data)
  res.status(200).json({ characters })
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
