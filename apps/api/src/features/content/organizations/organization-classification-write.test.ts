import { describe, expect, it } from 'vitest'
import type { Organization } from '@rpg/contracts'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { createHomebrewContent, updateContentEntity } from '../lib/content-write.service'
import { duplicateContentEntity } from '../lib/duplication/duplicate-content.service'
import {
  HomebrewOrganizationModel,
  type HomebrewOrganizationSchemaType,
} from './homebrew-organization.model'
import { organizationWriteConfig, toHomebrewOrganization } from './organizations.config'

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

  it('does not persist legacy activities on create', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(organizationWriteConfig, campaign.id, {
      slug: 'legacy-guild',
      name: 'Legacy Guild',
      organizationDomain: 'occupational',
      activities: ['trade'] as never,
      functions: ['trade'],
    })

    expect(created.functions).toEqual(['trade'])
    expect(created).not.toHaveProperty('activities')
  })

  it('persists practices independently of functions', async () => {
    const campaign = await makeTestCampaign()
    const brewery = await createHomebrewContent(organizationWriteConfig, campaign.id, {
      slug: 'ember-brewery',
      name: 'Ember Brewery',
      organizationDomain: 'commercial',
      organizationForm: 'company',
      functions: ['production'],
      practices: ['brewing', 'blacksmithing'],
    })

    expect(brewery).toMatchObject({
      functions: ['production'],
      practices: ['brewing', 'blacksmithing'],
    })
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

  it('snapshots membership titles from sourcePresetId at the create boundary', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(organizationWriteConfig, campaign.id, {
      slug: 'river-bank',
      name: 'River Bank',
      organizationDomain: 'commercial',
      organizationForm: 'company',
      functions: ['finance'],
      practices: ['banking'],
      sourcePresetId: 'bank',
    })

    expect(created.sourcePresetId).toBe('bank')
    expect(created.members.titles).toHaveLength(7)
    expect(created.members.titles[0]).toMatchObject({
      sourceTitleId: 'treasurer',
      label: 'Treasurer',
      priority: 50,
    })
    expect(created.members.titles.every((title) => title.id.startsWith('omt_'))).toBe(true)
  })

  it('leaves members.titles unchanged when classification is updated', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(organizationWriteConfig, campaign.id, {
      slug: 'river-bank',
      name: 'River Bank',
      organizationDomain: 'commercial',
      sourcePresetId: 'bank',
    })

    const updated = await updateContentEntity(organizationWriteConfig, campaign.id, created.id, {
      organizationDomain: 'government',
      functions: ['administration'],
    })

    expect(updated.members.titles).toEqual(created.members.titles)
    expect(updated.sourcePresetId).toBe('bank')
  })

  it('persists explicit members.titles on manual create without sourcePresetId', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(organizationWriteConfig, campaign.id, {
      slug: 'sealed-order',
      name: 'Order of the Third Seal',
      organizationDomain: 'religious',
      members: {
        classAffinityIds: [],
        speciesAffinityIds: [],
        titles: [
          {
            id: 'omt_custom',
            label: 'Keeper of the Third Seal',
            priority: 40,
          },
        ],
      },
    })

    expect(created).not.toHaveProperty('sourcePresetId')
    expect(created.members.titles).toEqual([
      {
        id: 'omt_custom',
        label: 'Keeper of the Third Seal',
        priority: 40,
      },
    ])
  })

  it('preserves members.titles array order through Mongo round-trip', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(organizationWriteConfig, campaign.id, {
      slug: 'river-bank',
      name: 'River Bank',
      organizationDomain: 'commercial',
      sourcePresetId: 'bank',
    })

    const doc = await HomebrewOrganizationModel.findById(created.id).lean<
      HomebrewOrganizationSchemaType & { _id: unknown }
    >()
    expect(doc).not.toBeNull()

    const roundTripped = toHomebrewOrganization(doc as never)
    expect(roundTripped.members.titles.map((title) => title.sourceTitleId)).toEqual(
      created.members.titles.map((title) => title.sourceTitleId),
    )
    expect(roundTripped.members.titles.map((title) => title.id)).toEqual(
      created.members.titles.map((title) => title.id),
    )
  })

  it('duplicates members.titles snapshot order and omits sourcePresetId', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(organizationWriteConfig, campaign.id, {
      slug: 'river-bank',
      name: 'River Bank',
      organizationDomain: 'commercial',
      sourcePresetId: 'bank',
    })

    const { entity } = await duplicateContentEntity({
      campaignId: campaign.id,
      contentType: 'organizations',
      entityId: created.id,
      requestedName: 'River Bank Copy',
    })
    const duplicate = entity as Organization

    expect(duplicate.sourcePresetId).toBeUndefined()
    expect(duplicate.members.titles).toEqual(created.members.titles)
  })
})
