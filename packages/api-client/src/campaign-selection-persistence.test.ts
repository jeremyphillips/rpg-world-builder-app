/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { writeStoredCampaignId } from '@rpg/contracts'

const { putJson } = vi.hoisted(() => ({
  putJson: vi.fn(),
}))

vi.mock('./request', async () => {
  const actual = await vi.importActual<typeof import('./request')>('./request')
  return {
    ...actual,
    putJson,
  }
})

import {
  persistCampaignSelectionBestEffort,
  persistCampaignSelectionLocal,
} from './campaign-selection-persistence'

describe('campaign-selection-persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    putJson.mockReset()
  })

  it('writes local storage immediately', () => {
    persistCampaignSelectionLocal('camp_1')
    expect(localStorage.getItem('rpg.selectedCampaignId')).toBe('camp_1')
  })

  it('keeps local storage when server persistence fails', async () => {
    putJson.mockRejectedValueOnce(new Error('network'))
    writeStoredCampaignId('camp_existing')

    await persistCampaignSelectionBestEffort('camp_1')

    expect(localStorage.getItem('rpg.selectedCampaignId')).toBe('camp_1')
  })
})
