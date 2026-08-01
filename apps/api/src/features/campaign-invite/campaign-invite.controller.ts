import type { Request, Response } from 'express'
import type { CampaignInviteRecipientInput } from '@rpg/contracts'

import {
  acceptCampaignInvite,
  acceptCampaignInviteById,
  listCampaignInvitesForOverview,
  resolveCampaignInviteByToken,
  resolveCampaignInviteById,
  revokeCampaignInvite,
  sendCampaignInvite,
  shareCampaignInviteLink,
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

export async function resolveById(req: Request, res: Response): Promise<void> {
  const { inviteId } = req.params as { inviteId: string }
  const resolution = await resolveCampaignInviteById(inviteId, req.user!.email)
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

export async function acceptById(req: Request, res: Response): Promise<void> {
  const { inviteId } = req.params as { inviteId: string }
  const result = await acceptCampaignInviteById({
    inviteId,
    userId: req.user!.id,
    userEmail: req.user!.email,
  })
  res.status(200).json(result)
}

export async function shareLink(req: Request, res: Response): Promise<void> {
  const { campaignId, inviteId } = req.params as { campaignId: string; inviteId: string }
  const result = await shareCampaignInviteLink({
    campaignId,
    inviteId,
    invitedByUserId: req.user!.id,
  })
  res.status(200).json(result)
}

export async function revoke(req: Request, res: Response): Promise<void> {
  const { campaignId, inviteId } = req.params as { campaignId: string; inviteId: string }
  await revokeCampaignInvite({
    campaignId,
    inviteId,
    revokedByUserId: req.user!.id,
  })
  res.status(204).send()
}
