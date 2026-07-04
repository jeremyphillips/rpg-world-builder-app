import type { Request, Response } from 'express'

import type { CreateCharacterInput } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { createCharacter, findCharacterForUser, listCharactersForUser } from './character.service'

export async function create(req: Request, res: Response): Promise<void> {
  const character = await createCharacter(req.body as CreateCharacterInput, req.user!.id)
  res.status(201).json({ character })
}

export async function list(req: Request, res: Response): Promise<void> {
  const characters = await listCharactersForUser(req.user!.id)
  res.status(200).json({ characters })
}

export async function getById(req: Request, res: Response): Promise<void> {
  const { characterId } = req.params as { characterId: string }
  const character = await findCharacterForUser(characterId, req.user!.id)
  if (!character) {
    throw new HttpError(404, 'not_found', 'Character not found.')
  }
  res.status(200).json({ character })
}
