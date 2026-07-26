import type { CreateCampaignInput, Campaign } from '@rpg/contracts'
import { resolveCampaignCreationPreset } from '@rpg/catalog/presets'

import { HttpError } from '../../lib/http-error'
import { writeInitialCharacterCreation, writeInitialMechanics } from '../vocabulary'
import { CampaignModel, type CampaignSchemaType } from './campaign.model'
import { CampaignMembershipModel } from './campaign-membership.model'
import { toCampaign } from './find-campaign-by-id'

type CampaignRecord = CampaignSchemaType & {
  _id: unknown
  createdAt: Date
  updatedAt: Date
}

export async function persistCreatedCampaign(
  createInput: CreateCampaignInput,
  createdBy: string,
): Promise<Campaign> {
  const presetResolution = resolveCampaignCreationPreset(createInput)
  if (!presetResolution.ok) {
    const message =
      presetResolution.reason === 'template_not_found'
        ? `Campaign template not found: ${presetResolution.campaignTemplateId}`
        : `Campaign template ruleset does not match the requested ruleset: ${presetResolution.campaignTemplateId}`
    throw HttpError.badRequest(message)
  }

  if (presetResolution.worldSeedPacks.length > 0) {
    throw HttpError.badRequest('World seed pack materialization is not available yet.')
  }

  const materializedInput = presetResolution.input
  const doc = await CampaignModel.create({
    identity: {
      name: materializedInput.name,
      ...(materializedInput.description !== undefined && {
        description: materializedInput.description,
      }),
      ...(materializedInput.imageKey !== undefined && { imageKey: materializedInput.imageKey }),
    },
    configuration: {
      ...(materializedInput.flavor !== undefined && { flavor: materializedInput.flavor }),
    },
    ...(materializedInput.rulesetId !== undefined && { rulesetId: materializedInput.rulesetId }),
    ...(presetResolution.template && {
      presetProvenance: {
        campaignTemplate: {
          id: presetResolution.template.metadata.id,
          version: presetResolution.template.metadata.version,
        },
        worldSeedPacks: presetResolution.worldSeedPacks.map((pack) => ({
          id: pack.metadata.id,
          version: pack.metadata.version,
        })),
      },
    }),
    createdBy,
  })

  const campaignId = String(doc._id)
  const rulesetId = doc.rulesetId

  try {
    await CampaignMembershipModel.create({
      campaignId,
      userId: createdBy,
      campaignRole: 'owner',
      controlledCharacterIds: [],
      invitedAt: new Date(),
      joinedAt: new Date(),
    })

    if (materializedInput.characterCreation) {
      await writeInitialCharacterCreation(
        campaignId,
        rulesetId,
        materializedInput.characterCreation,
      )
    }

    await writeInitialMechanics(campaignId, rulesetId)
  } catch (err) {
    await CampaignModel.deleteOne({ _id: doc._id })
    throw err
  }

  return toCampaign(doc.toObject() as CampaignRecord)
}
