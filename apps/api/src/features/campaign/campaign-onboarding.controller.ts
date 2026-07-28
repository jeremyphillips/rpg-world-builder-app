import type { Request, Response } from 'express'
import type { CompleteCampaignOnboardingInput } from '@rpg/contracts'

import { runCampaignCharacterAssignmentAction } from './participation/character-assignment/run-campaign-character-assignment-action.lib'
import {
  completeCampaignOnboardingForUser,
  getCampaignOnboardingContext,
  listEligibleCharactersForCampaignOnboarding,
} from './campaign-onboarding.service'

export async function getOnboardingContext(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const context = await getCampaignOnboardingContext({
    campaignId,
    userId: req.user!.id,
  })
  res.status(200).json({ context })
}

export async function listEligibleCharacters(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const characters = await listEligibleCharactersForCampaignOnboarding({
    campaignId,
    userId: req.user!.id,
  })
  res.status(200).json({ characters })
}

export async function completeOnboarding(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const body = req.body as CompleteCampaignOnboardingInput
  const result = await runCampaignCharacterAssignmentAction(() =>
    completeCampaignOnboardingForUser({
      campaignId,
      userId: req.user!.id,
      userEmail: req.user!.email,
      ...body,
    }),
  )
  res.status(200).json(result)
}
