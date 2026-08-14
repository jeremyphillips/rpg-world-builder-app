import { describe, expect, it } from 'vitest'
import { Types } from 'mongoose'

import { minimalNpcRequestInput } from '../../../test/fixtures/npcs'
import { minimalStandalonePcInput } from '../../../test/fixtures/characters'
import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { attachCharacterToCampaign, createCampaignNpc } from '../../campaign'
import { CharacterModel, createPcRecord } from '../../character'
import {
  deleteContentEntity,
  getContentDeletionAvailability,
} from '../lib/content-deletion.service'
import { demoteContentToDraft, getContentDemotionAvailability } from '../lib/content-status.service'
import { createHomebrewContent } from '../lib/content-write.service'
import { organizationWriteConfig } from './organizations.config'

useIntegrationDb()

const minimalOrganizationInput = {
  slug: 'iron-circle',
  name: 'Iron Circle',
  organizationDomain: 'military',
} as const

async function setOrganizationConnection(characterId: string, organizationId: string) {
  await CharacterModel.collection.updateOne(
    { _id: new Types.ObjectId(characterId) },
    {
      $set: {
        connections: {
          organizations: [{ organizationId }],
        },
      },
    },
  )
}

describe('organization lifecycle references', () => {
  it('blocks deletion for participating PCs and NPCs that reference the organization', async () => {
    const campaign = await makeTestCampaign()
    const organization = await createHomebrewContent(
      organizationWriteConfig,
      campaign.id,
      minimalOrganizationInput,
    )
    const pc = await createPcRecord(minimalStandalonePcInput, campaign.owner.id)
    await attachCharacterToCampaign({
      campaignId: campaign.id,
      characterId: pc.id,
      joinedAt: new Date().toISOString(),
    })
    const { character: npc } = await createCampaignNpc(campaign.id, {
      ...minimalNpcRequestInput,
      name: 'Circle Envoy',
    })

    await Promise.all([
      setOrganizationConnection(pc.id, organization.id),
      setOrganizationConnection(npc.id, organization.id),
    ])

    const availability = await getContentDeletionAvailability(
      organizationWriteConfig,
      campaign.id,
      organization.id,
    )
    expect(availability.status).toBe('blocked')
    if (availability.status !== 'blocked') throw new Error('expected blocked')
    expect(availability.blockers).toHaveLength(2)
    expect(
      availability.blockers
        .filter((blocker) => blocker.kind === 'usage')
        .map((blocker) => blocker.usage.id)
        .sort(),
    ).toEqual([pc.id, npc.id].sort())

    await expect(
      deleteContentEntity(organizationWriteConfig, campaign.id, organization.id),
    ).resolves.toMatchObject({ status: 'blocked' })
  })

  it('allows demotion while a participating character retains a reference', async () => {
    const campaign = await makeTestCampaign()
    const organization = await createHomebrewContent(organizationWriteConfig, campaign.id, {
      ...minimalOrganizationInput,
      slug: 'demotable-circle',
    })
    const { character: npc } = await createCampaignNpc(campaign.id, {
      ...minimalNpcRequestInput,
      name: 'Former Envoy',
    })
    await setOrganizationConnection(npc.id, organization.id)

    await expect(
      getContentDemotionAvailability(organizationWriteConfig, campaign.id, organization.id),
    ).resolves.toEqual({ status: 'allowed' })
    await expect(
      demoteContentToDraft(organizationWriteConfig, campaign.id, organization.id),
    ).resolves.toEqual({ status: 'demoted' })
  })
})
