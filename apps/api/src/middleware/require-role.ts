import type { NextFunction, Request, Response } from 'express'
import type { CampaignRole, PlatformRole } from '@rpg/contracts'

import { CampaignMembershipModel } from '../features/campaign/campaign-membership.model'
import { intersectControlledWithOpenParticipations } from '../features/campaign/participation/campaign-character-participation.repository'
import { HttpError } from '../lib/http-error'

/**
 * Guard for platform-level routes. Allow only the listed platform roles.
 * Must run after `requireAuth`. Responds 403 when the authenticated user
 * lacks a permitted role.
 */
export function requirePlatformRole(...roles: PlatformRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(HttpError.unauthorized())
      return
    }
    if (!roles.includes(req.user.role)) {
      next(HttpError.forbidden('Insufficient role'))
      return
    }
    next()
  }
}

/**
 * Guard for campaign-scoped routes. Loads the `CampaignMembership` for
 * `req.user` + `req.params.campaignId`, checks that the membership role is
 * in the allowed list, and attaches the membership to `req.campaignMembership`
 * for downstream handlers.
 *
 * Must run after `requireAuth`. Route must expose `:campaignId` param.
 * Responds 403 when the user is not a member or the role is not permitted.
 */
export function requireCampaignRole(...roles: CampaignRole[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(HttpError.unauthorized())
      return
    }

    const { campaignId } = req.params
    if (!campaignId) {
      next(HttpError.badRequest('Missing campaignId route parameter'))
      return
    }

    try {
      const membership = await CampaignMembershipModel.findOne({
        campaignId,
        userId: req.user.id,
      }).lean()

      if (!membership) {
        next(HttpError.forbidden('Not a member of this campaign'))
        return
      }

      if (!roles.includes(membership.campaignRole as CampaignRole)) {
        next(HttpError.forbidden('Insufficient campaign role'))
        return
      }

      const controlledCharacterIds = (membership.controlledCharacterIds ??
        (membership as { characterIds?: string[] }).characterIds ??
        []) as string[]

      const pcCharacterIds = await intersectControlledWithOpenParticipations(
        String(campaignId),
        controlledCharacterIds,
      )

      req.campaignMembership = {
        campaignId: membership.campaignId,
        userId: membership.userId,
        campaignRole: membership.campaignRole as CampaignRole,
        controlledCharacterIds,
        pcCharacterIds,
      }

      next()
    } catch (err) {
      next(err)
    }
  }
}
