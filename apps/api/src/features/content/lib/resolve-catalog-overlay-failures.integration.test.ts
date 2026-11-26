import { describe, expect, it } from 'vitest'

import { loadSeedFeats } from '@rpg/catalog/feats'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { featRegistration } from '../feats/feats.config'
import { FeatPatchModel } from '../feats/feat-patch.model'
import { resolveContentListForCampaign } from '../content.service'

useIntegrationDb()

describe('resolve catalog overlay failures', () => {
  it('isolates a malformed overlay on list resolve while healthy rows stay in records', async () => {
    const campaign = await makeTestCampaign()
    const feats = loadSeedFeats(campaign.rulesetId)
    const [broken, healthy] = feats.slice(0, 2)
    expect(broken).toBeDefined()
    expect(healthy).toBeDefined()

    await FeatPatchModel.create({
      campaignId: campaign.id,
      targetId: broken!.id,
      patch: { name: 'Unversioned overlay' },
    })
    await FeatPatchModel.create({
      campaignId: campaign.id,
      targetId: healthy!.id,
      patch: { version: 1, revision: 0, set: { name: 'Healthy Feat' } },
    })

    const { items, overlayFailures } = await resolveContentListForCampaign(
      featRegistration.read,
      campaign.id,
    )

    expect(overlayFailures).toEqual([
      expect.objectContaining({ targetId: broken!.id, code: 'unsupported_overlay_version' }),
    ])
    expect(items.some((row) => row.id === healthy!.id)).toBe(true)
    expect(items.some((row) => row.id === broken!.id)).toBe(false)
  })
})
