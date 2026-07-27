import type { Request, Response } from 'express'
import type {
  CampaignInviteRecipientInput,
  CompleteCampaignCharacterAssignmentResult,
  CompleteCampaignWithExistingCharacterInput,
  CompleteCampaignWithNewCharacterInput,
} from '@rpg/contracts'

import {
  isCampaignCharacterAssignmentFailureError,
  mapCampaignCharacterAssignmentFailureToHttpError,
} from './campaign-invite-completion-failure.lib'
import {
  acceptCampaignInvite,
  completeCampaignInviteWithExistingCharacter,
  completeCampaignInviteWithNewCharacter,
  getCampaignInviteOnboardingContext,
  listCampaignInvitesForOverview,
  listEligibleCharactersForInvite,
  resolveCampaignInviteByToken,
  revokeCampaignInvite,
  sendCampaignInvite,
  shareCampaignInviteLink,
} from './campaign-invite.service'

async function runInviteCompletion(
  action: () => Promise<CompleteCampaignCharacterAssignmentResult>,
): Promise<CompleteCampaignCharacterAssignmentResult> {
  try {
    return await action()
  } catch (error) {
    if (isCampaignCharacterAssignmentFailureError(error)) {
      throw mapCampaignCharacterAssignmentFailureToHttpError(error.failure)
    }
    throw error
  }
}

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
  const { characterId } = req.body as CompleteCampaignWithExistingCharacterInput
  const result = await runInviteCompletion(() =>
    completeCampaignInviteWithExistingCharacter({
      inviteId,
      userId: req.user!.id,
      characterId,
    }),
  )
  res.status(200).json(result)
}

export async function completeWithNewCharacter(req: Request, res: Response): Promise<void> {
  const { inviteId } = req.params as { inviteId: string }
  const { characterCreateInput } = req.body as CompleteCampaignWithNewCharacterInput
  const result = await runInviteCompletion(() =>
    completeCampaignInviteWithNewCharacter({
      inviteId,
      userId: req.user!.id,
      characterCreateInput,
    }),
  )
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
