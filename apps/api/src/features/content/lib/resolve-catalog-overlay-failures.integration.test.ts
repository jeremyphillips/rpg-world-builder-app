import { describe, expect, it } from 'vitest'

import { loadSeedFeats } from '@rpg/catalog/feats'
import { loadSeedSpells } from '@rpg/catalog/spells'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { expectHttpErrorAsync } from '../../../test/expect-http-error'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { HttpError } from '../../../lib/http-error'
import { buildCampaignContentEligibilityIndex } from '../../campaign-invite/campaign-invite-eligibility.lib'
import { featRegistration } from '../feats/feats.config'
import { FeatPatchModel } from '../feats/feat-patch.model'
import { spellRegistration } from '../spells/spells.config'
import { SpellPatchModel } from '../spells/spell-patch.model'
import {
  resolveCatalogForCampaign,
  resolveCatalogForCampaignWithOverlayContext,
  resolveContentListForCampaign,
} from '../content.service'
import { assertContentSpellReferences } from './assert-content-spell-references'
import { updateContentEntity } from './content-write.service'
import type { ContentWriteContext } from './content-write-config'

useIntegrationDb()

async function seedBrokenAndHealthyFeatOverlays(campaignId: string) {
  const feats = loadSeedFeats('srd-cc-5.2.1')
  const [broken, healthy] = feats.slice(0, 2)
  expect(broken).toBeDefined()
  expect(healthy).toBeDefined()
  if (!broken || !healthy) throw new Error('expected feat seeds')

  await FeatPatchModel.create({
    campaignId,
    targetId: broken.id,
    patch: { name: 'Unversioned overlay' },
  })
  await FeatPatchModel.create({
    campaignId,
    targetId: healthy.id,
    patch: { version: 1, revision: 0, set: { name: 'Healthy Feat' } },
  })

  return { broken, healthy }
}

describe('resolve catalog overlay failures', () => {
  it('isolates a malformed overlay on list resolve while healthy rows stay in records', async () => {
    const campaign = await makeTestCampaign()
    const { broken, healthy } = await seedBrokenAndHealthyFeatOverlays(campaign.id)

    const { items, overlayFailures } = await resolveContentListForCampaign(
      featRegistration.read,
      campaign.id,
    )

    expect(overlayFailures).toEqual([
      expect.objectContaining({ targetId: broken.id, code: 'unsupported_overlay_version' }),
    ])
    expect(items.some((row) => row.id === healthy.id)).toBe(true)
    expect(items.some((row) => row.id === broken.id)).toBe(false)
  })

  it('keeps resolveCatalogForCampaign records-only for healthy rows when a sibling overlay fails', async () => {
    const campaign = await makeTestCampaign()
    const { broken, healthy } = await seedBrokenAndHealthyFeatOverlays(campaign.id)

    const records = await resolveCatalogForCampaign(featRegistration.read, campaign.id)
    expect(records.some((row) => row.id === healthy.id)).toBe(true)
    expect(records.some((row) => row.id === broken.id)).toBe(false)
  })

  it('returns 409 when writing to a system row whose overlay failed to apply', async () => {
    const campaign = await makeTestCampaign()
    const { broken } = await seedBrokenAndHealthyFeatOverlays(campaign.id)

    await expectHttpErrorAsync(
      () =>
        updateContentEntity(featRegistration.write, campaign.id, broken.id, { name: 'Blocked' }),
      { status: 409, code: 'unsupported_overlay_version' },
    )
  })

  it('still builds campaign invite eligibility when a sibling overlay is malformed', async () => {
    const campaign = await makeTestCampaign()
    const { healthy } = await seedBrokenAndHealthyFeatOverlays(campaign.id)

    const index = await buildCampaignContentEligibilityIndex(campaign.id)
    expect(index.contentById.has(healthy.id)).toBe(true)
  })

  it('does not empty the spell map when an unrelated spell overlay fails', async () => {
    const campaign = await makeTestCampaign()
    const spells = loadSeedSpells('srd-cc-5.2.1')
    const broken = spells.find((spell) => spell.slug === 'fire-bolt')
    const healthy = spells.find((spell) => spell.slug === 'light')
    expect(broken).toBeDefined()
    expect(healthy).toBeDefined()
    if (!broken || !healthy) throw new Error('expected spell seeds')

    await SpellPatchModel.create({
      campaignId: campaign.id,
      targetId: broken.id,
      patch: { name: 'Unversioned overlay' },
    })

    const { records, overlayFailureIds } = await resolveCatalogForCampaignWithOverlayContext(
      spellRegistration.read,
      campaign.id,
    )

    expect(overlayFailureIds.has(broken.id)).toBe(true)
    expect(records.some((spell) => spell.id === healthy.id)).toBe(true)
    expect(records.some((spell) => spell.id === broken.id)).toBe(false)
  })

  it('reports unresolved_overlay_spell rather than unknown_spell when a referenced spell overlay fails', async () => {
    const campaign = await makeTestCampaign()
    const spells = loadSeedSpells('srd-cc-5.2.1')
    const brokenSpell = spells.find((spell) => spell.slug === 'fire-bolt')
    expect(brokenSpell).toBeDefined()
    if (!brokenSpell) throw new Error('expected fire-bolt')

    await SpellPatchModel.create({
      campaignId: campaign.id,
      targetId: brokenSpell.id,
      patch: { name: 'Unversioned overlay' },
    })

    const writeCtx: ContentWriteContext = {
      campaignId: campaign.id,
      rulesetId: 'srd-cc-5.2.1',
      mode: 'create',
      validationIntent: 'publish',
      input: {},
      normalized: {},
      effectiveBody: {},
    }

    try {
      await assertContentSpellReferences(writeCtx, {
        grantGroups: [{ grants: [{ spellIds: [brokenSpell.id] }] }],
      })
      throw new Error('expected validation_error')
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError)
      const httpError = error as HttpError
      expect(httpError.code).toBe('validation_error')
      expect(httpError.details).toEqual({
        issues: [
          expect.objectContaining({
            code: 'unresolved_overlay_spell',
            path: 'grantGroups.0.grants.0.spellIds.0',
          }),
        ],
      })
    }
  })

  it('resolves healthy spell references when a sibling spell overlay failed', async () => {
    const campaign = await makeTestCampaign()
    const spells = loadSeedSpells('srd-cc-5.2.1')
    const broken = spells.find((spell) => spell.slug === 'fire-bolt')
    const healthy = spells.find((spell) => spell.slug === 'light')
    expect(broken).toBeDefined()
    expect(healthy).toBeDefined()
    if (!broken || !healthy) throw new Error('expected spell seeds')

    await SpellPatchModel.create({
      campaignId: campaign.id,
      targetId: broken.id,
      patch: { name: 'Unversioned overlay' },
    })

    const writeCtx: ContentWriteContext = {
      campaignId: campaign.id,
      rulesetId: 'srd-cc-5.2.1',
      mode: 'create',
      validationIntent: 'publish',
      input: {},
      normalized: {},
      effectiveBody: {},
    }

    await expect(
      assertContentSpellReferences(writeCtx, {
        grantGroups: [{ grants: [{ spellIds: [healthy.id] }] }],
      }),
    ).resolves.toBeUndefined()
  })
})
