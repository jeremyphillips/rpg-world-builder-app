import { describe, expect, it } from 'vitest'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { createHomebrewContent, updateContentEntity } from '../lib/content-write.service'
import { organizationWriteConfig } from './organizations.config'

useIntegrationDb()

describe('organization subtype writes', () => {
  it('creates and updates organizations with a valid subtype', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(organizationWriteConfig, campaign.id, {
      slug: 'crown',
      name: 'The Crown',
      organizationKind: 'government',
      organizationSubtype: 'monarchy',
    })

    expect(created).toMatchObject({
      organizationKind: 'government',
      organizationSubtype: 'monarchy',
    })

    const updated = await updateContentEntity(organizationWriteConfig, campaign.id, created.id, {
      organizationSubtype: 'council',
    })
    expect(updated.organizationSubtype).toBe('council')
  })

  it('rejects a merged update that leaves an incompatible kind/subtype pair', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(organizationWriteConfig, campaign.id, {
      slug: 'crown',
      name: 'The Crown',
      organizationKind: 'government',
      organizationSubtype: 'monarchy',
    })

    await expect(
      updateContentEntity(organizationWriteConfig, campaign.id, created.id, {
        organizationKind: 'military',
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'validation_error',
    })
  })

  it('accepts a kind change when subtype is cleared in the same update', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(organizationWriteConfig, campaign.id, {
      slug: 'crown',
      name: 'The Crown',
      organizationKind: 'government',
      organizationSubtype: 'monarchy',
    })

    const updated = await updateContentEntity(organizationWriteConfig, campaign.id, created.id, {
      organizationKind: 'military',
      organizationSubtype: null,
    })

    expect(updated.organizationKind).toBe('military')
    expect(updated.organizationSubtype).toBeUndefined()
  })

  it('accepts replacing subtype when changing kind in the same update', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(organizationWriteConfig, campaign.id, {
      slug: 'crown',
      name: 'The Crown',
      organizationKind: 'government',
      organizationSubtype: 'monarchy',
    })

    const updated = await updateContentEntity(organizationWriteConfig, campaign.id, created.id, {
      organizationKind: 'military',
      organizationSubtype: 'army',
    })
    expect(updated).toMatchObject({
      organizationKind: 'military',
      organizationSubtype: 'army',
    })
  })
})
