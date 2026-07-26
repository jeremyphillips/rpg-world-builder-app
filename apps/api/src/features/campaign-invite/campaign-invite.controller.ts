import type { Request, Response } from 'express'
import type {
  CampaignInviteRecipientInput,
  CompleteCampaignInviteWithExistingCharacterInput,
} from '@rpg/contracts'

import {
  acceptCampaignInvite,
  completeCampaignInviteWithExistingCharacter,
  getCampaignInviteOnboardingContext,
  listCampaignInvitesForOverview,
  listEligibleCharactersForInvite,
  resolveCampaignInviteByToken,
  sendCampaignInvite,
} from './campaign-invite.service'

export async function send(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const { email } = req.body as CampaignInviteRecipientInput
  const result = await sendCampaignInvite({
    campaignId,
    email,
    invitedByUserId: req.user!.id,
  })
  res.status(201).json(result)
}

export async function list(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const invites = await listCampaignInvitesForOverview(campaignId)
  res.status(200).json({ invites })
}

export async function resolveByToken(req: Request, res: Response): Promise<void> {
  const { token } = req.params as { token: string }
  const resolution = await resolveCampaignInviteByToken(token)
  res.status(200).json({ resolution })
}

export async function acceptByToken(req: Request, res: Response): Promise<void> {
  const { token } = req.params as { token: string }
  const result = await acceptCampaignInvite({
    rawToken: token,
    userId: req.user!.id,
    userEmail: req.user!.email,
  })
  res.status(200).json(result)
}

export async function getOnboardingContext(req: Request, res: Response): Promise<void> {
  const { inviteId } = req.params as { inviteId: string }
  const context = await getCampaignInviteOnboardingContext({
    inviteId,
    userId: req.user!.id,
  })
  res.status(200).json({ context })
}

export async function listEligibleCharacters(req: Request, res: Response): Promise<void> {
  const { inviteId } = req.params as { inviteId: string }
  const characters = await listEligibleCharactersForInvite({
    inviteId,
    userId: req.user!.id,
  })
  res.status(200).json({ characters })
}

export async function completeWithExistingCharacter(req: Request, res: Response): Promise<void> {
  const { inviteId } = req.params as { inviteId: string }
  const { characterId } = req.body as CompleteCampaignInviteWithExistingCharacterInput
  const result = await completeCampaignInviteWithExistingCharacter({
    inviteId,
    userId: req.user!.id,
    characterId,
  })
  res.status(200).json(result)
}
