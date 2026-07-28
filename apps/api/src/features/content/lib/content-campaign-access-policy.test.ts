import { describe, expect, it } from 'vitest'

import { resolveContentCampaignAccess } from '@rpg/contracts'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { minimalStandalonePcInput } from '../../../test/fixtures/characters'
import { minimalNpcRequestInput } from '../../../test/fixtures/npcs'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { attachCharacterToCampaign, createCampaignNpc } from '../../campaign'
import { CharacterModel, createPcRecord } from '../../character'
import { resolveCatalogForCampaign } from '../content.service'
import { featWriteConfig } from '../feats/feats.config'
import { ContentCampaignAccessModel } from './content-campaign-access.model'
import { createHomebrewContent } from './content-write.service'
import { getContentDeletionAvailability, deleteContentEntity } from './content-deletion.service'
import {
  getContentDemotionAvailability,
  demoteContentToDraft,
  promoteContentToPublished,
} from './content-status.service'
import {
  updateContentCampaignAccess,
  attachCampaignAccessForTargetType,
} from './content-campaign-access.service'

useIntegrationDb()

const minimalFeatInput = {
  slug: 'policy-campaign-access-feat',
  name: 'Policy Campaign Access Feat',
  category: 'origin' as const,
  repeatable: { allowed: false },
}

describe('content campaign access policy', () => {
  it('sets effectiveAudience to none when availability is off', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(featWriteConfig, campaign.id, minimalFeatInput)

    const result = await updateContentCampaignAccess(featWriteConfig, campaign.id, created.id, {
      available: false,
      visibilityMode: 'all_players',
      participantIds: [],
    })

    expect(result.status).toBe('updated')
    if (result.status !== 'updated') throw new Error('expected updated')
    expect(result.campaignAccess.effectiveAudience).toBe('none')
    expect(resolveContentCampaignAccess(result.campaignAccess).effectiveAudience).toBe('none')
  })

  it('does not hide existing character references when availability is off', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(featWriteConfig, campaign.id, {
      ...minimalFeatInput,
      slug: 'policy-referenced-feat',
    })

    const { character: npc } = await createCampaignNpc(campaign.id, {
      ...minimalNpcRequestInput,
      name: 'Feat NPC',
      feats: [{ featId: created.id }],
    })

    await ContentCampaignAccessModel.create({
      campaignId: campaign.id,
      targetType: 'feats',
      targetId: created.id,
      available: false,
      visibilityMode: 'dm_only',
      participantIds: [],
    })

    const catalog = await resolveCatalogForCampaign(featWriteConfig.readConfig, campaign.id)
    const createdFeat = catalog.find((feat) => feat.id === created.id)
    expect(createdFeat).toBeDefined()
    const [withAccess] = await attachCampaignAccessForTargetType(campaign.id, 'feats', [
      createdFeat!,
    ])
    expect(withAccess).toBeDefined()
    expect(withAccess!.campaignAccess.effectiveAudience).toBe('none')

    const reloadedNpc = await CharacterModel.findById(npc.id).lean()
    expect(reloadedNpc).toBeTruthy()
    expect(reloadedNpc?.feats?.some((feat) => feat.featId === created.id)).toBe(true)
  })

  it('keeps delete and demote gating independent of campaignAccess.available', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(featWriteConfig, campaign.id, {
      ...minimalFeatInput,
      slug: 'policy-gated-feat',
    })

    await promoteContentToPublished(featWriteConfig, campaign.id, created.id)

    await createCampaignNpc(campaign.id, {
      ...minimalNpcRequestInput,
      name: 'Blocking Feat NPC',
      feats: [{ featId: created.id }],
    })

    await updateContentCampaignAccess(featWriteConfig, campaign.id, created.id, {
      available: true,
      visibilityMode: 'all_players',
      participantIds: [],
    })

    const deleteWhenAvailable = await getContentDeletionAvailability(
      featWriteConfig,
      campaign.id,
      created.id,
    )
    expect(deleteWhenAvailable.status).toBe('blocked')

    await updateContentCampaignAccess(featWriteConfig, campaign.id, created.id, {
      available: false,
      visibilityMode: 'all_players',
      participantIds: [],
    })

    const deleteWhenUnavailable = await getContentDeletionAvailability(
      featWriteConfig,
      campaign.id,
      created.id,
    )
    expect(deleteWhenUnavailable.status).toBe('blocked')
    expect(await deleteContentEntity(featWriteConfig, campaign.id, created.id)).toMatchObject({
      status: 'blocked',
    })

    const demoteWhenUnavailable = await getContentDemotionAvailability(
      featWriteConfig,
      campaign.id,
      created.id,
    )
    expect(demoteWhenUnavailable.status).toBe('blocked')
    expect(await demoteContentToDraft(featWriteConfig, campaign.id, created.id)).toMatchObject({
      status: 'blocked',
    })

    const unreferenced = await createHomebrewContent(featWriteConfig, campaign.id, {
      ...minimalFeatInput,
      slug: 'policy-unreferenced-feat',
      name: 'Policy Unreferenced Feat',
    })
    await promoteContentToPublished(featWriteConfig, campaign.id, unreferenced.id)

    await updateContentCampaignAccess(featWriteConfig, campaign.id, unreferenced.id, {
      available: false,
      visibilityMode: 'dm_only',
      participantIds: [],
    })

    expect(
      await getContentDeletionAvailability(featWriteConfig, campaign.id, unreferenced.id),
    ).toEqual({ status: 'allowed' })
    expect(
      await getContentDemotionAvailability(featWriteConfig, campaign.id, unreferenced.id),
    ).toEqual({ status: 'allowed' })

    const [listed] = await attachCampaignAccessForTargetType(campaign.id, 'feats', [unreferenced])
    expect(listed).toBeDefined()
    expect(listed!.campaignAccess.effectiveAudience).toBe('none')
  })

  it('marks stale participant ids as unavailable when resolving campaign access', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(featWriteConfig, campaign.id, {
      ...minimalFeatInput,
      slug: 'policy-stale-participant-feat',
    })

    const pc = await createPcRecord(
      { ...minimalStandalonePcInput, name: 'Valid PC' },
      campaign.owner.id,
    )

    await attachCharacterToCampaign({
      campaignId: campaign.id,
      characterId: pc.id,
      joinedAt: new Date().toISOString(),
    })

    await ContentCampaignAccessModel.create({
      campaignId: campaign.id,
      targetType: 'feats',
      targetId: created.id,
      available: true,
      visibilityMode: 'specific_players',
      participantIds: [pc.id, 'stale-pc'],
    })

    const [listed] = await attachCampaignAccessForTargetType(campaign.id, 'feats', [created])
    expect(listed).toBeDefined()
    expect(listed!.campaignAccess.participantIds).toEqual([pc.id])
    expect(listed!.campaignAccess.unavailableParticipantIds).toEqual(['stale-pc'])
  })
})
