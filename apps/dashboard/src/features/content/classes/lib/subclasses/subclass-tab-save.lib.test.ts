import { describe, expect, it, vi } from 'vitest'

import type { Subclass } from '@rpg/contracts'

import { makeSubclass } from '@/test/fixtures/factories/additional/subclass'
import { toCampaignAccessPatch } from '../../../lib/campaign-access/campaign-access-state'
import { CAMPAIGN_ACCESS_CREATE_DEFERRED_ERROR } from '../../../lib/campaign-access/campaign-access-labels'
import type { SubclassFormValues } from './subclass-form-fields'
import {
  persistSubclassCampaignAccess,
  reportSubclassSaveResult,
  saveDraftSubclass,
  saveExistingSubclass,
} from './subclass-tab-save.lib'

vi.mock('../../../lib/campaign-access/campaign-access-api', () => ({
  updateContentCampaignAccess: vi.fn(),
}))

vi.mock('@/lib/notify', () => ({
  notifyCoordinatedContentSaveSuccess: vi.fn(),
}))

import { updateContentCampaignAccess } from '../../../lib/campaign-access/campaign-access-api'
import { notifyCoordinatedContentSaveSuccess } from '@/lib/notify'

const emptyValues: SubclassFormValues = {
  name: 'Champion',
  tagline: '',
  description: '',
  features: [],
}

const savedSubclass: Subclass = makeSubclass({
  id: 'sub-1',
  name: 'Champion',
  classId: 'class-1',
})

const unavailableAccessPatch = toCampaignAccessPatch({
  available: false,
  visibilityMode: 'all_players',
  participantIds: [],
})

describe('persistSubclassCampaignAccess', () => {
  it('skips persistence when pending access is absent or default', async () => {
    const onDeferredError = vi.fn()

    await persistSubclassCampaignAccess({
      campaignId: 'campaign-1',
      classId: 'class-1',
      subclassId: 'sub-1',
      pendingAccess: null,
      onDeferredError,
    })

    expect(updateContentCampaignAccess).not.toHaveBeenCalled()
    expect(onDeferredError).not.toHaveBeenCalled()
  })

  it('reports deferred access error when persistence fails', async () => {
    vi.mocked(updateContentCampaignAccess).mockRejectedValueOnce(new Error('network'))
    const onDeferredError = vi.fn()

    await persistSubclassCampaignAccess({
      campaignId: 'campaign-1',
      classId: 'class-1',
      subclassId: 'sub-1',
      pendingAccess: unavailableAccessPatch,
      onDeferredError,
    })

    expect(onDeferredError).toHaveBeenCalledWith(CAMPAIGN_ACCESS_CREATE_DEFERRED_ERROR)
  })
})

describe('saveDraftSubclass', () => {
  it('creates subclass, persists access, and hands off draft', async () => {
    const create = vi.fn().mockResolvedValue(savedSubclass)
    const onDraftSaved = vi.fn()
    const onDeferredAccessError = vi.fn()
    vi.mocked(updateContentCampaignAccess).mockResolvedValueOnce({
      status: 'updated',
      campaignAccess: {
        available: true,
        visibilityMode: 'all_players',
        participantIds: [],
        unavailableParticipantIds: [],
        effectiveAudience: 'all_players',
      },
    })

    await saveDraftSubclass({
      campaignId: 'campaign-1',
      classId: 'class-1',
      draftId: 'draft-1',
      values: emptyValues,
      pendingAccess: unavailableAccessPatch,
      create,
      onDraftSaved,
      onDeferredAccessError,
    })

    expect(create).toHaveBeenCalledOnce()
    expect(updateContentCampaignAccess).toHaveBeenCalledOnce()
    expect(onDraftSaved).toHaveBeenCalledWith('draft-1', savedSubclass)
    expect(onDeferredAccessError).not.toHaveBeenCalled()
  })
})

describe('saveExistingSubclass', () => {
  it('coordinates access and body saves', async () => {
    const callOrder: string[] = []
    const saveAccess = vi.fn().mockImplementation(async () => {
      callOrder.push('access')
      return {
        status: 'updated' as const,
        campaignAccess: {
          available: true,
          visibilityMode: 'all_players' as const,
          participantIds: [],
          unavailableParticipantIds: [],
          effectiveAudience: 'all_players' as const,
        },
      }
    })
    const updateBody = vi.fn().mockImplementation(async () => {
      callOrder.push('body')
      return savedSubclass
    })
    const onBodySaved = vi.fn()

    const result = await saveExistingSubclass({
      subclassId: 'sub-1',
      classId: 'class-1',
      values: emptyValues,
      bodyWasDirty: true,
      accessWasDirty: true,
      saveAccess,
      updateBody,
      onBodySaved,
    })

    expect(result.status).toBe('saved')
    expect(callOrder).toEqual(['access', 'body'])
    expect(onBodySaved).toHaveBeenCalledWith('sub-1')
  })

  it('skips body save when accessOnly is true', async () => {
    const saveAccess = vi.fn().mockResolvedValue({
      status: 'updated' as const,
      campaignAccess: {
        available: true,
        visibilityMode: 'all_players' as const,
        participantIds: [],
        unavailableParticipantIds: [],
        effectiveAudience: 'all_players' as const,
      },
    })
    const updateBody = vi.fn()
    const onBodySaved = vi.fn()

    await saveExistingSubclass({
      subclassId: 'sub-1',
      classId: 'class-1',
      values: emptyValues,
      accessOnly: true,
      bodyWasDirty: true,
      accessWasDirty: true,
      saveAccess,
      updateBody,
      onBodySaved,
    })

    expect(saveAccess).toHaveBeenCalledOnce()
    expect(updateBody).not.toHaveBeenCalled()
    expect(onBodySaved).not.toHaveBeenCalled()
  })
})

describe('reportSubclassSaveResult', () => {
  it('notifies on successful coordinated save', () => {
    const setSaveError = vi.fn()

    reportSubclassSaveResult(
      {
        status: 'saved',
        saved: { accessSaved: true, bodySaved: false, accessAvailable: true },
      },
      'Champion',
      setSaveError,
    )

    expect(notifyCoordinatedContentSaveSuccess).toHaveBeenCalledOnce()
    expect(setSaveError).not.toHaveBeenCalled()
  })

  it('sets save error on body failure', () => {
    const setSaveError = vi.fn()

    reportSubclassSaveResult(
      { status: 'body_failed', error: new Error('save failed') },
      'Champion',
      setSaveError,
    )

    expect(setSaveError).toHaveBeenCalledWith('Could not save subclass.')
  })

  it('sets campaign access error on invalid access save', () => {
    const setSaveError = vi.fn()

    reportSubclassSaveResult({ status: 'access_invalid' }, 'Champion', setSaveError)

    expect(setSaveError).toHaveBeenCalledWith('Could not save subclass campaign access.')
  })
})
