import { describe, expect, it } from 'vitest'
import { Types } from 'mongoose'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { createHomebrewContent, updateContentEntity } from '../lib/content-write.service'
import { organizationWriteConfig } from '../organizations/organizations.config'
import { locationWriteConfig } from './locations.config'

useIntegrationDb()

const minimalOrganizationInput = {
  slug: 'northern-watch',
  name: 'Northern Watch',
  organizationKind: 'military',
} as const

async function seedWorld(campaignId: string) {
  return createHomebrewContent(locationWriteConfig, campaignId, {
    slug: 'northern-realm',
    kind: 'world',
    name: 'Northern Realm',
  })
}

describe('territorial authority lifecycle', () => {
  it('round-trips territorial authority on region create and PATCH', async () => {
    const campaign = await makeTestCampaign()
    const world = await seedWorld(campaign.id)
    const organization = await createHomebrewContent(
      organizationWriteConfig,
      campaign.id,
      minimalOrganizationInput,
    )

    const created = await createHomebrewContent(locationWriteConfig, campaign.id, {
      slug: 'grey-coast',
      kind: 'region',
      name: 'Grey Coast',
      parentLocationId: world.id,
      territorialAuthority: [
        {
          id: 'ta-governs',
          organizationId: organization.id,
          kind: 'governs',
        },
      ],
    })

    expect(created.kind).toBe('region')
    if (created.kind !== 'region') throw new Error('expected region')
    expect(created.territorialAuthority).toHaveLength(1)

    const updated = await updateContentEntity(locationWriteConfig, campaign.id, created.id, {
      kind: 'region',
      territorialAuthority: [
        ...created.territorialAuthority,
        {
          id: 'ta-claims',
          organizationId: organization.id,
          kind: 'claims',
        },
      ],
    })

    if (updated.kind !== 'region') throw new Error('expected region')
    expect(updated.territorialAuthority).toHaveLength(2)
  })

  it('rejects unknown organization references and non-region territorial authority', async () => {
    const campaign = await makeTestCampaign()
    const world = await seedWorld(campaign.id)

    await expect(
      createHomebrewContent(locationWriteConfig, campaign.id, {
        slug: 'bad-org-ref',
        kind: 'region',
        name: 'Bad Org Ref',
        parentLocationId: world.id,
        territorialAuthority: [
          {
            id: 'ta-1',
            organizationId: new Types.ObjectId().toString(),
            kind: 'governs',
          },
        ],
      }),
    ).rejects.toMatchObject({ status: 400, code: 'invalid_reference' })

    await expect(
      createHomebrewContent(locationWriteConfig, campaign.id, {
        slug: 'bad-kind',
        kind: 'settlement',
        name: 'Bad Kind',
        settlementType: 'city',
        parentLocationId: world.id,
        territorialAuthority: [
          {
            id: 'ta-1',
            organizationId: new Types.ObjectId().toString(),
            kind: 'governs',
          },
        ],
      }),
    ).rejects.toMatchObject({ status: 400 })
  })
})
