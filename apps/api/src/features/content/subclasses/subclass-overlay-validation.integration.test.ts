import { describe, expect, it } from 'vitest'

import { loadSeedSubclasses } from '@rpg/catalog/classes'

import { SUBCLASS_PARENT_OVERLAY_UNRESOLVED_ISSUE_CODE } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { expectHttpErrorAsync } from '../../../test/expect-http-error'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { ClassPatchModel } from '../classes/class-patch.model'
import { classContentConfig } from '../classes/classes.config'
import { resolveContentListForCampaign } from '../content.service'
import { createHomebrewContent } from '../lib/content-write.service'
import { batchGetContentCampaignAccessAvailability } from '../lib/content-campaign-access.service'
import { assertSubclassBatchTargetsBelongToClass } from './assert-subclass-batch-targets'
import { assertSubclassParentClassExists } from './assert-subclass-parent-class'
import { resolveSubclassesForCampaign } from './list-subclasses'
import { SubclassPatchModel } from './subclass-patch.model'
import { subclassWriteConfig } from './subclasses.config'

useIntegrationDb()

const FIGHTER_CLASS_ID = 'srd-cc-5.2.1:fighter'
const WIZARD_CLASS_ID = 'srd-cc-5.2.1:wizard'

describe('subclass overlay validation', () => {
  it('rejects an unresolved parent class overlay instead of a missing-parent error', async () => {
    const campaign = await makeTestCampaign()
    await ClassPatchModel.create({
      campaignId: campaign.id,
      targetId: FIGHTER_CLASS_ID,
      patch: { name: 'Unversioned overlay' },
    })

    const { items, overlayFailures } = await resolveContentListForCampaign(
      classContentConfig,
      campaign.id,
    )
    expect(overlayFailures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          targetId: FIGHTER_CLASS_ID,
          code: 'unsupported_overlay_version',
        }),
      ]),
    )
    expect(items.some((row) => row.id === FIGHTER_CLASS_ID)).toBe(false)
    expect(items.some((row) => row.id === WIZARD_CLASS_ID)).toBe(true)

    try {
      await assertSubclassParentClassExists(campaign.id, FIGHTER_CLASS_ID)
      expect.fail('expected overlay-blocked parent class')
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError)
      expect(error).toMatchObject({ status: 409, code: 'unsupported_overlay_version' })
      expect((error as HttpError).details).toEqual({
        issues: [
          expect.objectContaining({
            path: 'classId',
            code: SUBCLASS_PARENT_OVERLAY_UNRESOLVED_ISSUE_CODE,
          }),
        ],
      })
    }
  })

  it('reports a genuinely missing parent class as validation_error', async () => {
    const campaign = await makeTestCampaign()
    const { items, overlayFailures } = await resolveContentListForCampaign(
      classContentConfig,
      campaign.id,
    )
    expect(items.some((row) => row.id === 'missing-class')).toBe(false)
    expect(overlayFailures.some((failure) => failure.targetId === 'missing-class')).toBe(false)

    try {
      await assertSubclassParentClassExists(campaign.id, 'missing-class')
      expect.fail('expected missing parent class validation error')
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError)
      expect(error).toMatchObject({ status: 400, code: 'validation_error' })
      expect((error as HttpError).details).toEqual({
        issues: [
          expect.objectContaining({
            path: 'classId',
            code: 'unknown_class',
          }),
        ],
      })
    }
  })

  it('resolves a healthy parent class while a sibling class overlay is broken', async () => {
    const campaign = await makeTestCampaign()
    await ClassPatchModel.create({
      campaignId: campaign.id,
      targetId: FIGHTER_CLASS_ID,
      patch: { name: 'Unversioned overlay' },
    })

    const wizard = await assertSubclassParentClassExists(campaign.id, WIZARD_CLASS_ID)
    expect(wizard.id).toBe(WIZARD_CLASS_ID)
    expect(wizard.slug).toBe('wizard')
  })

  it('skips an unresolved subclass, accepts a healthy sibling, and rejects a different parent', async () => {
    const campaign = await makeTestCampaign()
    const champion = loadSeedSubclasses('srd-cc-5.2.1').find((row) => row.slug === 'champion')
    const evocation = loadSeedSubclasses('srd-cc-5.2.1').find(
      (row) => row.slug === 'school-of-evocation',
    )
    expect(champion).toBeDefined()
    expect(evocation).toBeDefined()
    if (!champion || !evocation) return

    const healthy = await createHomebrewContent(subclassWriteConfig, campaign.id, {
      slug: 'healthy-fighter-sibling',
      name: 'Healthy Fighter Sibling',
      classId: FIGHTER_CLASS_ID,
      tagline: 'Resolved sibling',
      features: [{ kind: 'custom', id: 'feature-1', name: 'Test Feature', level: 3 }],
    })

    await SubclassPatchModel.create({
      campaignId: campaign.id,
      targetId: champion.id,
      patch: { name: 'Unversioned overlay' },
    })

    const resolved = await resolveSubclassesForCampaign(campaign.id, FIGHTER_CLASS_ID)
    expect(resolved.some((row) => row.id === healthy.id)).toBe(true)
    expect(resolved.some((row) => row.id === champion.id)).toBe(false)

    const { overlayFailures } = await resolveContentListForCampaign(
      subclassWriteConfig.readConfig,
      campaign.id,
    )
    expect(overlayFailures.some((failure) => failure.targetId === champion.id)).toBe(true)

    await expectHttpErrorAsync(
      () =>
        assertSubclassBatchTargetsBelongToClass(campaign.id, FIGHTER_CLASS_ID, [
          champion.id,
          healthy.id,
        ]),
      { status: 409, code: 'unsupported_overlay_version' },
    )

    await expectHttpErrorAsync(
      () => assertSubclassBatchTargetsBelongToClass(campaign.id, FIGHTER_CLASS_ID, [evocation.id]),
      { status: 400, code: 'mixed_subclass_parents' },
    )
  })

  it('returns not_found for wholly unknown subclass ids from the batch service', async () => {
    const campaign = await makeTestCampaign()
    const missingId = 'missing-subclass-id'

    await assertSubclassBatchTargetsBelongToClass(campaign.id, FIGHTER_CLASS_ID, [missingId])

    const batch = await batchGetContentCampaignAccessAvailability(
      subclassWriteConfig,
      campaign.id,
      [missingId],
    )
    expect(batch.targets).toEqual([
      expect.objectContaining({
        targetId: missingId,
        failure: expect.objectContaining({ code: 'not_found' }),
      }),
    ])
  })
})
