import { describe, expect, it } from 'vitest'

import { HOMEBREW_SUMMARY_CONTENT_TYPES } from '@rpg/contracts'

import { VISIBLE_SIDEBAR_CONTENT } from './visible-sidebar-content-registry'

describe('visible-sidebar-content-registry', () => {
  it('covers every homebrew summary content type in sidebar order', () => {
    const registryTypes = VISIBLE_SIDEBAR_CONTENT.map((entry) => entry.contentType)
    expect(registryTypes).toEqual([...HOMEBREW_SUMMARY_CONTENT_TYPES])
  })

  it('assigns a unique label per content type', () => {
    const labels = VISIBLE_SIDEBAR_CONTENT.map((entry) => entry.label)
    expect(new Set(labels).size).toBe(labels.length)
  })
})
