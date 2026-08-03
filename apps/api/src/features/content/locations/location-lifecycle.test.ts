import { describe, expect, it } from 'vitest'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import {
  deleteContentEntity,
  getContentDeletionAvailability,
} from '../lib/content-deletion.service'
import { createHomebrewContent, updateContentEntity } from '../lib/content-write.service'
import { locationWriteConfig } from './locations.config'

useIntegrationDb()

async function seedWorld(campaignId: string, slug: string, name: string) {
  return createHomebrewContent(locationWriteConfig, campaignId, {
    slug,
    kind: 'world',
    name,
  })
}

async function seedRegion(
  campaignId: string,
  slug: string,
  name: string,
  parentLocationId: string,
) {
  return createHomebrewContent(locationWriteConfig, campaignId, {
    slug,
    kind: 'region',
    name,
    parentLocationId,
  })
}

describe('location lifecycle hierarchy', () => {
  it('blocks deletion when child locations reference the parent', async () => {
    const campaign = await makeTestCampaign()
    const world = await seedWorld(campaign.id, 'faerun', 'Faerûn')
    const region = await seedRegion(campaign.id, 'sword-coast', 'Sword Coast', world.id)

    const availability = await getContentDeletionAvailability(
      locationWriteConfig,
      campaign.id,
      world.id,
    )
    expect(availability.status).toBe('blocked')
    if (availability.status !== 'blocked') throw new Error('expected blocked')
    expect(availability.blockers).toHaveLength(1)
    expect(availability.blockers[0]).toMatchObject({
      kind: 'content',
      contentTypeKey: 'locations',
      id: region.id,
      label: 'Sword Coast',
    })

    await expect(
      deleteContentEntity(locationWriteConfig, campaign.id, world.id),
    ).resolves.toMatchObject({ status: 'blocked' })
  })

  it('rejects self-parent updates', async () => {
    const campaign = await makeTestCampaign()
    const world = await seedWorld(campaign.id, 'self-parent-world', 'Self Parent World')

    await expect(
      updateContentEntity(locationWriteConfig, campaign.id, world.id, {
        kind: 'world',
        parentLocationId: world.id,
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'invalid_hierarchy',
    })
  })

  it('rejects kind changes that would invalidate direct children', async () => {
    const campaign = await makeTestCampaign()
    const world = await seedWorld(campaign.id, 'waterdeep-world', 'Waterdeep World')
    const settlement = await createHomebrewContent(locationWriteConfig, campaign.id, {
      slug: 'waterdeep',
      kind: 'settlement',
      name: 'Waterdeep',
      settlementType: 'city',
      parentLocationId: world.id,
    })
    await createHomebrewContent(locationWriteConfig, campaign.id, {
      slug: 'dock-ward',
      kind: 'district',
      name: 'Dock Ward',
      parentLocationId: settlement.id,
    })

    await expect(
      updateContentEntity(locationWriteConfig, campaign.id, settlement.id, {
        kind: 'site',
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'invalid_hierarchy',
    })
  })

  it('rejects parent selections that would create a cycle', async () => {
    const campaign = await makeTestCampaign()
    const world = await seedWorld(campaign.id, 'cycle-world', 'Cycle World')
    const region = await seedRegion(campaign.id, 'cycle-region', 'Cycle Region', world.id)
    const settlement = await createHomebrewContent(locationWriteConfig, campaign.id, {
      slug: 'cycle-settlement',
      kind: 'settlement',
      name: 'Cycle Settlement',
      parentLocationId: region.id,
    })

    await expect(
      updateContentEntity(locationWriteConfig, campaign.id, world.id, {
        kind: 'world',
        parentLocationId: settlement.id,
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'invalid_hierarchy',
    })
  })
})
