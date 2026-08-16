import { describe, expect, it } from 'vitest'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { createHomebrewContent, updateContentEntity } from '../lib/content-write.service'
import { organizationWriteConfig } from './organizations.config'

useIntegrationDb()

describe('organization classification writes', () => {
  it('creates and updates organizations with an optional reusable form', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(organizationWriteConfig, campaign.id, {
      slug: 'crown',
      name: 'The Crown',
      organizationDomain: 'government',
      organizationForm: 'association',
    })

    expect(created).toMatchObject({
      organizationDomain: 'government',
      organizationForm: 'association',
    })

    const updated = await updateContentEntity(organizationWriteConfig, campaign.id, created.id, {
      organizationForm: 'company',
    })
    expect(updated.organizationForm).toBe('company')
  })

  it('keeps form when domain changes because the axes are independent', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(organizationWriteConfig, campaign.id, {
      slug: 'crown',
      name: 'The Crown',
      organizationDomain: 'government',
      organizationForm: 'association',
    })

    const updated = await updateContentEntity(organizationWriteConfig, campaign.id, created.id, {
      organizationDomain: 'military',
    })

    expect(updated).toMatchObject({
      organizationDomain: 'military',
      organizationForm: 'association',
    })
  })

  it('clears optional form without changing domain', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(organizationWriteConfig, campaign.id, {
      slug: 'crown',
      name: 'The Crown',
      organizationDomain: 'government',
      organizationForm: 'association',
    })

    const updated = await updateContentEntity(organizationWriteConfig, campaign.id, created.id, {
      organizationForm: null,
    })

    expect(updated.organizationDomain).toBe('government')
    expect(updated.organizationForm).toBeUndefined()
  })

  it('persists Pass A form, function, and practice values', async () => {
    const campaign = await makeTestCampaign()
    const shippingLine = await createHomebrewContent(organizationWriteConfig, campaign.id, {
      slug: 'crown-shipping',
      name: 'Crown Shipping Line',
      organizationDomain: 'commercial',
      organizationForm: 'company',
      functions: ['transport', 'trade'],
    })
    expect(shippingLine).toMatchObject({
      organizationDomain: 'commercial',
      organizationForm: 'company',
      functions: ['transport', 'trade'],
    })
    expect(shippingLine).not.toHaveProperty('authoringPresetId')

    const treasury = await createHomebrewContent(organizationWriteConfig, campaign.id, {
      slug: 'royal-treasury',
      name: 'Royal Treasury',
      organizationDomain: 'government',
      organizationForm: 'office',
      functions: ['administration'],
    })
    expect(treasury.organizationForm).toBe('office')

    const host = await createHomebrewContent(organizationWriteConfig, campaign.id, {
      slug: 'royal-host',
      name: 'Royal Host',
      organizationDomain: 'military',
      organizationForm: 'force',
      functions: ['warfare', 'defense'],
    })
    expect(host.organizationForm).toBe('force')
  })

  it('accepts replacing form when changing domain in the same update', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(organizationWriteConfig, campaign.id, {
      slug: 'crown',
      name: 'The Crown',
      organizationDomain: 'government',
      organizationForm: 'association',
    })

    const updated = await updateContentEntity(organizationWriteConfig, campaign.id, created.id, {
      organizationDomain: 'military',
      organizationForm: 'order',
    })
    expect(updated).toMatchObject({
      organizationDomain: 'military',
      organizationForm: 'order',
    })
  })
})
