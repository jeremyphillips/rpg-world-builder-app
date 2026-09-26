import type { Request, Response } from 'express'

import type { CharacterMediaPatchInput, CreateCharacterInput } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import {
  createCharacter,
  deleteCharacterForUser,
  findCharacterForUser,
  listCharactersForUser,
  patchCharacterMediaForUser,
} from './character.service'
import { enrichPcsWithOpenCampaign } from './enrich-pcs-with-open-campaign.lib'
import { resolveCharacterRoutingContext } from '../campaign'

export async function create(req: Request, res: Response): Promise<void> {
  const character = await createCharacter(req.body as CreateCharacterInput, req.user!.id)
  res.status(201).json({ character })
}

export async function list(req: Request, res: Response): Promise<void> {
  const characters = await listCharactersForUser(req.user!.id)
  const enriched = await enrichPcsWithOpenCampaign(characters)
  res.status(200).json({ characters: enriched })
}

export async function getById(req: Request, res: Response): Promise<void> {
  const { characterId } = req.params as { characterId: string }
  const character = await findCharacterForUser(characterId, req.user!.id)
  if (!character) {
    throw new HttpError(404, 'not_found', 'Character not found.')
  }
  res.status(200).json({ character })
}

export async function getRoutingContext(req: Request, res: Response): Promise<void> {
  const { characterId } = req.params as { characterId: string }
  const routingContext = await resolveCharacterRoutingContext(characterId, req.user!.id)
  if (routingContext === null) {
    throw new HttpError(404, 'not_found', 'Character not found.')
  }
  res.status(200).json(routingContext)
}

function throwCharacterMediaPatchError(
  result: Awaited<ReturnType<typeof patchCharacterMediaForUser>>,
): asserts result is Exclude<Awaited<ReturnType<typeof patchCharacterMediaForUser>>, string> {
  if (typeof result === 'string') {
    if (result === 'not_found') {
      throw new HttpError(404, 'not_found', 'Character not found.')
    }
    if (result === 'stale_revision') {
      throw new HttpError(
        409,
        'conflict',
        'Character media was updated elsewhere. Reload and try again.',
      )
    }
    if (result === 'validation_failed') {
      throw HttpError.badRequest('Character media failed validation.')
    }
    if (result === 'asset_unavailable') {
      throw HttpError.badRequest('One or more media assets are unavailable.')
    }
    throw HttpError.badRequest('Could not update character media.')
  }
}

export async function patchMedia(req: Request, res: Response): Promise<void> {
  const { characterId } = req.params as { characterId: string }
  const result = await patchCharacterMediaForUser(
    characterId,
    req.user!.id,
    req.body as CharacterMediaPatchInput,
  )
  throwCharacterMediaPatchError(result)
  res.status(200).json({ character: result })
}

export async function remove(req: Request, res: Response): Promise<void> {
  const { characterId } = req.params as { characterId: string }
  const result = await deleteCharacterForUser(characterId, req.user!.id)
  if (result.status === 'not_found') {
    throw new HttpError(404, 'not_found', 'Character not found.')
  }
  if (result.status === 'blocked') {
    res.status(409).json({ result })
    return
  }
  res.status(204).send()
}
