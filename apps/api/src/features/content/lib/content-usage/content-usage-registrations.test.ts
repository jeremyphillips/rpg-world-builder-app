import { describe, expect, it, vi } from 'vitest'

import {
  CONTENT_USAGE_REGISTRATIONS,
  getContentUsageRegistration,
} from './content-usage-registrations'
import { defineContentUsage } from './define-content-usage'
import type { ContentUsageSource } from './content-usage-source'

describe('content usage registrations', () => {
  it('registers every character-backed content surface including subclasses', () => {
    const keys = Object.keys(CONTENT_USAGE_REGISTRATIONS).sort()
    expect(keys).toEqual(
      [
        'classes',
        'equipment',
        'feats',
        'organizations',
        'skill-proficiencies',
        'species',
        'spells',
        'subclasses',
      ].sort(),
    )
  })

  it('declares characters overview scope for v1 character-only batch', () => {
    for (const registration of Object.values(CONTENT_USAGE_REGISTRATIONS)) {
      if (!registration) continue
      expect(registration.overviewUsageScope).toBe('characters')
      expect(registration.sources.some((source) => source.batch)).toBe(true)
      expect(registration.sources.some((source) => source.entry)).toBe(true)
    }
  })

  it('uses slug lookup for skill-proficiencies', () => {
    expect(getContentUsageRegistration('skill-proficiencies').lookupKey).toBe('slug')
    expect(getContentUsageRegistration('classes').lookupKey).toBe('id')
  })

  it('treats overviewUsageScope as metadata that does not change resolver topology', async () => {
    const loadBlockerIndex = vi.fn(async () => new Map())
    const source: ContentUsageSource = { loadBlockerIndex }

    const charactersScoped = defineContentUsage({
      contentType: 'classes',
      sources: [{ source, entry: true, batch: true }],
      summaryLabels: { singular: 'character', plural: 'characters' },
      overviewUsageScope: 'characters',
    })
    const completeScoped = defineContentUsage({
      contentType: 'classes',
      sources: [{ source, entry: true, batch: true }],
      summaryLabels: { singular: 'character', plural: 'characters' },
      overviewUsageScope: 'complete',
    })

    const ctx = { campaignId: 'camp_1' }
    await charactersScoped.entryResolver(ctx, 'id-1')
    await completeScoped.entryResolver(ctx, 'id-1')
    await charactersScoped.batchResolver(ctx, ['id-1'])
    await completeScoped.batchResolver(ctx, ['id-1'])

    expect(loadBlockerIndex).toHaveBeenCalledTimes(4)
  })
})
