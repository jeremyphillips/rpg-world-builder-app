import { describe, expect, it } from 'vitest'

import type { ArrayConfig } from '../../field-config'
import { resolveArrayShowSectionHeader } from './resolve-array-show-section-header.lib'

const baseConfig = { kind: 'array', name: 'items', label: 'Items', fields: [] } as ArrayConfig

describe('resolveArrayShowSectionHeader', () => {
  it('is false for sr-only labels without chrome', () => {
    expect(
      resolveArrayShowSectionHeader({
        labelMode: 'srOnly',
        addActionLayout: 'stacked',
        hasAddAction: true,
        arrayIssueCount: 0,
        hasContainerIssue: false,
        config: { ...baseConfig, labelVisibility: 'srOnly' },
      }),
    ).toBe(false)
  })

  it('is true when a visible label, hint, inline add, issues, or required marker apply', () => {
    expect(
      resolveArrayShowSectionHeader({
        labelMode: 'visible',
        addActionLayout: 'stacked',
        hasAddAction: false,
        arrayIssueCount: 0,
        hasContainerIssue: false,
        config: baseConfig,
      }),
    ).toBe(true)

    expect(
      resolveArrayShowSectionHeader({
        labelMode: 'srOnly',
        sectionHint: 'Help',
        addActionLayout: 'stacked',
        hasAddAction: false,
        arrayIssueCount: 0,
        hasContainerIssue: false,
        config: { ...baseConfig, labelVisibility: 'srOnly', hint: 'Help' },
      }),
    ).toBe(true)

    expect(
      resolveArrayShowSectionHeader({
        labelMode: 'anonymous',
        addActionLayout: 'inline',
        hasAddAction: true,
        arrayIssueCount: 0,
        hasContainerIssue: false,
        config: { kind: 'array', name: 'items', fields: [] },
      }),
    ).toBe(true)
  })
})
