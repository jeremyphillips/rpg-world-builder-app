import { describe, expect, it } from 'vitest'

import { HOMEBREW_SUMMARY_CONTENT_TYPE_KEYS } from '@rpg/contracts'
import { contentTypeKeysWithVisibleInSidebar } from '@rpg/content-types'

import { VISIBLE_SIDEBAR_CONTENT } from './content-registry'

describe('content-registry', () => {
  it('includes every sidebar-visible integration manifest type exactly once', () => {
    const registryTypes = VISIBLE_SIDEBAR_CONTENT.map((entry) => entry.contentType)
    const visibleTypes = contentTypeKeysWithVisibleInSidebar()
    expect(new Set(registryTypes)).toEqual(new Set(visibleTypes))
    expect(registryTypes).toHaveLength(visibleTypes.length)
  })

  it('covers every homebrew summary content type in sidebar order', () => {
    const registryTypes = VISIBLE_SIDEBAR_CONTENT.map((entry) => entry.contentType)
    expect(registryTypes).toEqual([...HOMEBREW_SUMMARY_CONTENT_TYPE_KEYS])
  })

  it('assigns a unique label per content type', () => {
    const labels = VISIBLE_SIDEBAR_CONTENT.map((entry) => entry.label)
    expect(new Set(labels).size).toBe(labels.length)
  })
})
