import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { useIntegrationApp } from '../../../test/setup/integration-app'
import { characterCreationScenarios } from '../../../test/fixtures/character-creation'
import { INITIATE_TIER_ID } from '../../../test/fixtures/starting-wealth'
import {
  authedCampaignContext,
  getRulesetPatchRoute,
  patchCharacterCreationRoute,
  patchMechanicsRoute,
} from '../../../test/helpers/http'

const getApp = useIntegrationApp()

describe('ruleset patch routes', () => {
  it('returns resolved character creation for campaign members', async () => {
    const app = getApp()
    const { agent, csrfToken, campaignId } = await authedCampaignContext(app)

    const res = await getRulesetPatchRoute(agent, csrfToken, campaignId).expect(200)

    expect(res.body.patch.characterCreation.startingLevel).toBe(1)
  })

  it('patches character creation for campaign managers', async () => {
    const app = getApp()
    const { agent, csrfToken, campaignId } = await authedCampaignContext(app)

    const res = await patchCharacterCreationRoute(agent, csrfToken, campaignId, {
      startingLevel: 5,
      importedCharacters: { policy: 'approval_required' },
    }).expect(200)

    expect(res.body.patch.characterCreation).toMatchObject({
      startingLevel: 5,
      importedCharacters: { policy: 'approval_required' },
    })
  })

  it('patches multiclassing for campaign managers', async () => {
    const app = getApp()
    const { agent, csrfToken, campaignId } = await authedCampaignContext(app)

    const res = await patchCharacterCreationRoute(agent, csrfToken, campaignId, {
      multiclassing: { enabled: false },
    }).expect(200)

    expect(res.body.patch.characterCreation.multiclassing.enabled).toBe(false)
  })

  it('patches starting wealth tiers for campaign managers', async () => {
    const app = getApp()
    const { agent, csrfToken, campaignId } = await authedCampaignContext(app)

    const res = await patchCharacterCreationRoute(
      agent,
      csrfToken,
      campaignId,
      characterCreationScenarios.initiateWithoutClassEquipment(),
    ).expect(200)

    expect(
      res.body.patch.characterCreation.startingWealth.tiers.find(
        (tier: { id: string }) => tier.id === INITIATE_TIER_ID,
      )?.includeNormalStartingEquipment,
    ).toBe(false)
  })

  it('patches mechanics for campaign managers', async () => {
    const app = getApp()
    const { agent, csrfToken, campaignId } = await authedCampaignContext(app)

    const res = await patchMechanicsRoute(agent, csrfToken, campaignId, {
      editionPreset: { id: '1e' },
    }).expect(200)

    expect(res.body.patch.mechanics).toMatchObject({
      editionPreset: { id: '1e', modified: false },
      armorClass: { mode: 'descending', base: 10 },
      attackResolution: { mode: 'combat_tables' },
    })
  })

  it('requires authentication for ruleset patch reads', async () => {
    const app = getApp()

    await request(app).get('/api/campaigns/000000000000000000000000/ruleset-patch').expect(401)
  })
})
