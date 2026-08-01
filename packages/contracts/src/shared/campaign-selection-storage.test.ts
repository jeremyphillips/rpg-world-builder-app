/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest'

import {
  CAMPAIGN_SELECTION_STORAGE_KEY,
  readStoredCampaignId,
  writeStoredCampaignId,
} from './campaign-selection-storage'

describe('campaign-selection-storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('round-trips the selected campaign id', () => {
    writeStoredCampaignId('camp_1')

    expect(readStoredCampaignId()).toBe('camp_1')
    expect(localStorage.getItem(CAMPAIGN_SELECTION_STORAGE_KEY)).toBe('camp_1')
  })

  it('returns null when nothing is stored', () => {
    expect(readStoredCampaignId()).toBeNull()
  })
})
