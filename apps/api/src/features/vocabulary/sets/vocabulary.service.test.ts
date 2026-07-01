import { describe, expect, it } from 'vitest'

import { CREATURE_TYPE_SET_ID } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { CampaignRulesetPatchModel } from '../lib/campaign-ruleset-patch.model'
import {
  createCampaignVocabularyEntry,
  deleteCampaignVocabularyEntry,
  resolveVocabularySetForCampaign,
  updateVocabularyEntry,
} from './vocabulary.service'

useIntegrationDb()

describe('CampaignRulesetPatch persistence', () => {
  it('upserts one document per (campaignId, rulesetId)', async () => {
    const campaign = await makeTestCampaign()

    await createCampaignVocabularyEntry(campaign.id, {
      setId: CREATURE_TYPE_SET_ID,
      id: 'robot',
      label: 'Robot',
    })

    const docs = await CampaignRulesetPatchModel.find({ campaignId: campaign.id }).lean()
    expect(docs).toHaveLength(1)
    expect(docs[0]?.rulesetId).toBe('srd-cc-5.2.1')
  })

  it('updates the same patch document on subsequent writes', async () => {
    const campaign = await makeTestCampaign()

    await createCampaignVocabularyEntry(campaign.id, {
      setId: CREATURE_TYPE_SET_ID,
      id: 'robot',
      label: 'Robot',
    })
    const docAfterCreate = await CampaignRulesetPatchModel.findOne({
      campaignId: campaign.id,
    }).lean()

    await createCampaignVocabularyEntry(campaign.id, {
      setId: CREATURE_TYPE_SET_ID,
      id: 'golem',
      label: 'Golem',
    })
    await updateVocabularyEntry(campaign.id, CREATURE_TYPE_SET_ID, 'humanoid', {
      label: 'People',
    })

    const docs = await CampaignRulesetPatchModel.find({ campaignId: campaign.id }).lean()
    expect(docs).toHaveLength(1)
    expect(String(docs[0]?._id)).toBe(String(docAfterCreate?._id))

    const creatureTypePatch = docs[0]?.vocabulary?.find(
      (entry) => entry.setId === CREATURE_TYPE_SET_ID,
    )
    expect(creatureTypePatch?.campaignEntries).toHaveLength(2)
    expect(
      creatureTypePatch?.systemEntryPatches?.find((patch) => patch.id === 'humanoid')?.label,
    ).toBe('People')
  })
})

describe('vocabulary write rules', () => {
  it('rejects duplicate ids against system and campaign entries', async () => {
    const campaign = await makeTestCampaign()

    await expect(
      createCampaignVocabularyEntry(campaign.id, {
        setId: CREATURE_TYPE_SET_ID,
        id: 'humanoid',
        label: 'Duplicate',
      }),
    ).rejects.toMatchObject({ status: 409 })

    await createCampaignVocabularyEntry(campaign.id, {
      setId: CREATURE_TYPE_SET_ID,
      id: 'robot',
      label: 'Robot',
    })

    await expect(
      createCampaignVocabularyEntry(campaign.id, {
        setId: CREATURE_TYPE_SET_ID,
        id: 'robot',
        label: 'Another Robot',
      }),
    ).rejects.toMatchObject({ status: 409 })
  })

  it('patches and disables system entries without deleting them', async () => {
    const campaign = await makeTestCampaign()

    const patched = await updateVocabularyEntry(campaign.id, CREATURE_TYPE_SET_ID, 'humanoid', {
      label: 'People',
      status: 'disabled',
    })

    expect(patched.options.find((option) => option.id === 'humanoid')).toMatchObject({
      label: 'People',
      status: 'disabled',
      source: 'system',
    })

    await expect(
      deleteCampaignVocabularyEntry(campaign.id, CREATURE_TYPE_SET_ID, 'humanoid'),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('edits, disables, and deletes unused campaign entries', async () => {
    const campaign = await makeTestCampaign()

    await createCampaignVocabularyEntry(campaign.id, {
      setId: CREATURE_TYPE_SET_ID,
      id: 'robot',
      label: 'Robot',
    })

    const disabled = await updateVocabularyEntry(campaign.id, CREATURE_TYPE_SET_ID, 'robot', {
      status: 'disabled',
    })
    expect(disabled.options.find((option) => option.id === 'robot')?.status).toBe('disabled')

    const renamed = await updateVocabularyEntry(campaign.id, CREATURE_TYPE_SET_ID, 'robot', {
      label: 'Automaton',
    })
    expect(renamed.options.find((option) => option.id === 'robot')?.label).toBe('Automaton')

    const deleted = await deleteCampaignVocabularyEntry(campaign.id, CREATURE_TYPE_SET_ID, 'robot')
    expect(deleted.options.some((option) => option.id === 'robot')).toBe(false)
  })

  it('returns usage counts as zero from the stub', async () => {
    const campaign = await makeTestCampaign()
    const set = await resolveVocabularySetForCampaign(campaign.id, CREATURE_TYPE_SET_ID)

    expect(set.options.every((option) => option.usedBy === 0)).toBe(true)
  })

  it('allows delete while usage stub reports zero references', async () => {
    const campaign = await makeTestCampaign()

    await createCampaignVocabularyEntry(campaign.id, {
      setId: CREATURE_TYPE_SET_ID,
      id: 'robot',
      label: 'Robot',
    })

    await expect(
      deleteCampaignVocabularyEntry(campaign.id, CREATURE_TYPE_SET_ID, 'robot'),
    ).resolves.toBeDefined()
  })
})

describe('resolveVocabularySetForCampaign', () => {
  it('merges seed and patch entries for members', async () => {
    const campaign = await makeTestCampaign()

    await updateVocabularyEntry(campaign.id, CREATURE_TYPE_SET_ID, 'fey', {
      status: 'disabled',
    })
    await createCampaignVocabularyEntry(campaign.id, {
      setId: CREATURE_TYPE_SET_ID,
      id: 'robot',
      label: 'Robot',
    })

    const set = await resolveVocabularySetForCampaign(campaign.id, CREATURE_TYPE_SET_ID)
    expect(set.options.find((option) => option.id === 'fey')?.status).toBe('disabled')
    expect(set.options.find((option) => option.id === 'robot')?.source).toBe('campaign')
  })

  it('throws when the campaign does not exist', async () => {
    await expect(
      resolveVocabularySetForCampaign('000000000000000000000000', CREATURE_TYPE_SET_ID),
    ).rejects.toBeInstanceOf(HttpError)
  })
})
