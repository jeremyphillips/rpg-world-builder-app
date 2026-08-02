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
  vocabularyUsageContextForCampaign,
} from './vocabulary.service'

useIntegrationDb()

describe('CampaignRulesetPatch persistence', () => {
  it('upserts one document per (campaignId, rulesetId)', async () => {
    const campaign = await makeTestCampaign()

    await createCampaignVocabularyEntry(vocabularyUsageContextForCampaign(campaign.id), {
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

    await createCampaignVocabularyEntry(vocabularyUsageContextForCampaign(campaign.id), {
      setId: CREATURE_TYPE_SET_ID,
      id: 'robot',
      label: 'Robot',
    })
    const docAfterCreate = await CampaignRulesetPatchModel.findOne({
      campaignId: campaign.id,
    }).lean()

    await createCampaignVocabularyEntry(vocabularyUsageContextForCampaign(campaign.id), {
      setId: CREATURE_TYPE_SET_ID,
      id: 'golem',
      label: 'Golem',
    })
    await updateVocabularyEntry(
      vocabularyUsageContextForCampaign(campaign.id),
      CREATURE_TYPE_SET_ID,
      'humanoid',
      {
        label: 'People',
      },
    )

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
      createCampaignVocabularyEntry(vocabularyUsageContextForCampaign(campaign.id), {
        setId: CREATURE_TYPE_SET_ID,
        id: 'humanoid',
        label: 'Duplicate',
      }),
    ).rejects.toMatchObject({ status: 409 })

    await createCampaignVocabularyEntry(vocabularyUsageContextForCampaign(campaign.id), {
      setId: CREATURE_TYPE_SET_ID,
      id: 'robot',
      label: 'Robot',
    })

    await expect(
      createCampaignVocabularyEntry(vocabularyUsageContextForCampaign(campaign.id), {
        setId: CREATURE_TYPE_SET_ID,
        id: 'robot',
        label: 'Another Robot',
      }),
    ).rejects.toMatchObject({ status: 409 })
  })

  it('patches and disables unreferenced system entries without deleting them', async () => {
    const campaign = await makeTestCampaign()

    const patched = await updateVocabularyEntry(
      vocabularyUsageContextForCampaign(campaign.id),
      CREATURE_TYPE_SET_ID,
      'beast',
      {
        label: 'Wild beast',
        status: 'disabled',
      },
    )

    expect(patched.options.find((option) => option.id === 'beast')).toMatchObject({
      label: 'Wild beast',
      status: 'disabled',
      source: 'system',
    })

    await expect(
      deleteCampaignVocabularyEntry(
        vocabularyUsageContextForCampaign(campaign.id),
        CREATURE_TYPE_SET_ID,
        'beast',
      ),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('blocks disabling referenced system entries', async () => {
    const campaign = await makeTestCampaign()

    await expect(
      updateVocabularyEntry(
        vocabularyUsageContextForCampaign(campaign.id),
        CREATURE_TYPE_SET_ID,
        'humanoid',
        {
          status: 'disabled',
        },
      ),
    ).rejects.toMatchObject({ status: 409 })
  })

  it('edits, disables, and deletes unused campaign entries', async () => {
    const campaign = await makeTestCampaign()

    await createCampaignVocabularyEntry(vocabularyUsageContextForCampaign(campaign.id), {
      setId: CREATURE_TYPE_SET_ID,
      id: 'robot',
      label: 'Robot',
    })

    const disabled = await updateVocabularyEntry(
      vocabularyUsageContextForCampaign(campaign.id),
      CREATURE_TYPE_SET_ID,
      'robot',
      {
        status: 'disabled',
      },
    )
    expect(disabled.options.find((option) => option.id === 'robot')?.status).toBe('disabled')

    const renamed = await updateVocabularyEntry(
      vocabularyUsageContextForCampaign(campaign.id),
      CREATURE_TYPE_SET_ID,
      'robot',
      {
        label: 'Automaton',
      },
    )
    expect(renamed.options.find((option) => option.id === 'robot')?.label).toBe('Automaton')

    const deleted = await deleteCampaignVocabularyEntry(
      vocabularyUsageContextForCampaign(campaign.id),
      CREATURE_TYPE_SET_ID,
      'robot',
    )
    expect(deleted.options.some((option) => option.id === 'robot')).toBe(false)
  })

  it('attaches usage counts from registered resolvers', async () => {
    const campaign = await makeTestCampaign()
    const set = await resolveVocabularySetForCampaign(
      vocabularyUsageContextForCampaign(campaign.id),
      CREATURE_TYPE_SET_ID,
    )

    for (const option of set.options) {
      expect(option.usedBy).toBeGreaterThanOrEqual(0)
    }

    const humanoid = set.options.find((option) => option.id === 'humanoid')
    expect(humanoid?.usedBy).toBeGreaterThan(0)
  })

  it('allows delete while usage stub reports zero references', async () => {
    const campaign = await makeTestCampaign()

    await createCampaignVocabularyEntry(vocabularyUsageContextForCampaign(campaign.id), {
      setId: CREATURE_TYPE_SET_ID,
      id: 'robot',
      label: 'Robot',
    })

    await expect(
      deleteCampaignVocabularyEntry(
        vocabularyUsageContextForCampaign(campaign.id),
        CREATURE_TYPE_SET_ID,
        'robot',
      ),
    ).resolves.toBeDefined()
  })
})

describe('resolveVocabularySetForCampaign', () => {
  it('merges seed and patch entries for members', async () => {
    const campaign = await makeTestCampaign()

    await updateVocabularyEntry(
      vocabularyUsageContextForCampaign(campaign.id),
      CREATURE_TYPE_SET_ID,
      'fey',
      {
        status: 'disabled',
      },
    )
    await createCampaignVocabularyEntry(vocabularyUsageContextForCampaign(campaign.id), {
      setId: CREATURE_TYPE_SET_ID,
      id: 'robot',
      label: 'Robot',
    })

    const set = await resolveVocabularySetForCampaign(
      vocabularyUsageContextForCampaign(campaign.id),
      CREATURE_TYPE_SET_ID,
    )
    expect(set.options.find((option) => option.id === 'fey')?.status).toBe('disabled')
    expect(set.options.find((option) => option.id === 'robot')?.source).toBe('campaign')
  })

  it('throws when the campaign does not exist', async () => {
    await expect(
      resolveVocabularySetForCampaign(
        vocabularyUsageContextForCampaign('000000000000000000000000'),
        CREATURE_TYPE_SET_ID,
      ),
    ).rejects.toBeInstanceOf(HttpError)
  })
})
