import type { Request, Response } from 'express'
import type { ChangePasswordInput, UpdateProfileInput } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { updateProfile, changePassword } from './user.service'

export async function patchProfile(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id
  const input = req.body as UpdateProfileInput
  const user = await updateProfile(userId, input)
  if (!user) throw HttpError.unauthorized()
  res.status(200).json({ user })
}

export async function patchPassword(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id
  const { currentPassword, newPassword } = req.body as ChangePasswordInput
  await changePassword(userId, currentPassword, newPassword)
  res.status(200).json({ ok: true })
}
