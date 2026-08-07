import type { Request, Response } from 'express'

import { HttpError } from '../../../lib/http-error'
import { resolveLocationConnectedParties } from './resolve-location-connected-parties'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 50

function parsePositiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback
  }
  return Math.floor(parsed)
}

export async function listLocationConnectedParties(req: Request, res: Response): Promise<void> {
  const { campaignId, locationId } = req.params as { campaignId: string; locationId: string }
  const page = parsePositiveInt(req.query.page, DEFAULT_PAGE)
  const pageSize = parsePositiveInt(req.query.pageSize, DEFAULT_PAGE_SIZE)

  const result = await resolveLocationConnectedParties({
    campaignId,
    locationId,
    page,
    pageSize,
  })

  if (!result) {
    throw new HttpError(404, 'not_found', 'Location not found in campaign.')
  }

  res.status(200).json(result)
}
