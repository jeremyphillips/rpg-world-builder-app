import { describe, expect, it, vi } from 'vitest'

import type { ContentTypeConfig } from './content-type-config'
import { loadSystemContent, loadSystemContentSlugs } from './content-type-config'

type TestContent = {
  id: string
}

describe('content type system capability', () => {
  it('returns empty system records and slugs when bundled content is absent', () => {
    const config: ContentTypeConfig<TestContent> = {
      type: 'campaign-authored',
      loadHomebrew: vi.fn(async () => []),
    }

    expect(loadSystemContent(config, 'srd-cc-5.2.1')).toEqual([])
    expect(loadSystemContentSlugs(config, 'srd-cc-5.2.1')).toEqual(new Set())
  })

  it('delegates records and slugs through a bundled system capability', () => {
    const records = [{ id: 'system:item' }]
    const slugs = new Set(['item'])
    const config: ContentTypeConfig<TestContent> = {
      type: 'bundled',
      system: {
        load: vi.fn(() => records),
        slugs: vi.fn(() => slugs),
        loadPatches: vi.fn(async () => []),
      },
      loadHomebrew: vi.fn(async () => []),
    }

    expect(loadSystemContent(config, 'srd-cc-5.2.1')).toBe(records)
    expect(loadSystemContentSlugs(config, 'srd-cc-5.2.1')).toBe(slugs)
  })
})
