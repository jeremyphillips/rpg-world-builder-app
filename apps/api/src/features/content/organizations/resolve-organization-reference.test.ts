import { describe, expect, it } from 'vitest'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { minimalNpcRequestInput } from '../../../test/fixtures/npcs'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { createCampaignNpc } from '../../campaign'
import { CharacterModel } from '../../character'
import { createHomebrewContent } from '../lib/content-write.service'
import { organizationWriteConfig } from './organizations.config'
import {
  resolveCharacterOrganizationReferences,
  resolveOrganizationReference,
} from './resolve-organization-reference'

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
      authorization: {
        source: 'content-viewer',
        viewer: { kind: 'pc', characterIds: ['character-a'] },
      },
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
        authorization: {
          source: 'content-viewer',
          viewer: { kind: 'pc', characterIds: ['character-b'] },
        },
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
        authorization: { source: 'content-viewer', viewer: { kind: 'manage' } },
      }),
    ).resolves.toBeNull()
  })

  it('bulk-resolves saved references and preserves missing entries', async () => {
    const campaign = await makeTestCampaign()
    const organization = await createHomebrewContent(
      organizationWriteConfig,
      campaign.id,
      {
        slug: 'hidden-society',
        name: 'Hidden Society',
      },
      { status: 'draft' },
    )
    const { character } = await createCampaignNpc(campaign.id, minimalNpcRequestInput)
    await CharacterModel.findByIdAndUpdate(character.id, {
      connections: {
        organizations: [
          { organizationId: organization.id },
          { organizationId: '000000000000000000000000' },
        ],
      },
    })

    await expect(
      resolveCharacterOrganizationReferences({
        campaignId: campaign.id,
        characterId: character.id,
        authorization: { source: 'content-viewer', viewer: { kind: 'manage' } },
      }),
    ).resolves.toEqual([
      {
        organizationId: organization.id,
        organization: expect.objectContaining({ id: organization.id, status: 'draft' }),
      },
      {
        organizationId: '000000000000000000000000',
        organization: null,
      },
    ])
  })
})
