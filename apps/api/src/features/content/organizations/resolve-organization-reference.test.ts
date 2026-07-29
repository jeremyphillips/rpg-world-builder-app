import { describe, expect, it } from 'vitest'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { createHomebrewContent } from '../lib/content-write.service'
import { organizationWriteConfig } from './organizations.config'
import { resolveOrganizationReference } from './resolve-organization-reference'

useIntegrationDb()

describe('resolveOrganizationReference', () => {
  it('resolves a draft saved reference for an authorized character viewer', async () => {
    const campaign = await makeTestCampaign()
    const organization = await createHomebrewContent(
      organizationWriteConfig,
      campaign.id,
      {
        slug: 'hidden-society',
        name: 'Hidden Society',
        organizationKind: 'other',
      },
      { status: 'draft' },
    )

    const resolved = await resolveOrganizationReference({
      campaignId: campaign.id,
      organizationId: organization.id,
      characterId: 'character-a',
      viewer: { kind: 'pc', characterIds: ['character-a'] },
    })

    expect(resolved).toMatchObject({
      id: organization.id,
      name: 'Hidden Society',
      status: 'draft',
    })
  })

  it('rejects viewers who cannot read the referenced character', async () => {
    const campaign = await makeTestCampaign()

    await expect(
      resolveOrganizationReference({
        campaignId: campaign.id,
        organizationId: '000000000000000000000000',
        characterId: 'character-a',
        viewer: { kind: 'pc', characterIds: ['character-b'] },
      }),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('returns null for an authorized missing reference', async () => {
    const campaign = await makeTestCampaign()

    await expect(
      resolveOrganizationReference({
        campaignId: campaign.id,
        organizationId: '000000000000000000000000',
        characterId: 'character-a',
        viewer: { kind: 'manage' },
      }),
    ).resolves.toBeNull()
  })
})
