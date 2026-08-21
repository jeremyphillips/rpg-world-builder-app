import { describe, expect, it } from 'vitest'
import type { TabbedFormTab } from '@rpg/ui/form'

import {
  assertHeaderOnlyTabsHaveValidationWiring,
  assertTabErrorPathCoverage,
} from './tabbed-form-validation-test-utils'

describe('assertHeaderOnlyTabsHaveValidationWiring', () => {
  it('passes when header-only tabs declare errorPaths and resolverFields', () => {
    const tabs: TabbedFormTab[] = [
      {
        id: 'traits',
        label: 'Traits',
        fields: [],
        header: 'editor',
        errorPaths: ['traits'],
        resolverFields: [{ type: 'text', name: 'traits', label: 'Traits', required: true }],
      },
    ]

    expect(() => assertHeaderOnlyTabsHaveValidationWiring(tabs)).not.toThrow()
  })

  it('fails when errorPaths is missing', () => {
    const tabs: TabbedFormTab[] = [
      {
        id: 'traits',
        label: 'Traits',
        fields: [],
        header: 'editor',
        resolverFields: [{ type: 'text', name: 'traits', label: 'Traits', required: true }],
      },
    ]

    expect(() => assertHeaderOnlyTabsHaveValidationWiring(tabs)).toThrow(/must declare errorPaths/)
  })

  it('respects exemptTabIds and skipHeaderOnlyValidationWiring', () => {
    const tabs: TabbedFormTab[] = [
      { id: 'subclasses', label: 'Subclasses', fields: [], header: 'editor' },
      {
        id: 'other',
        label: 'Other',
        fields: [],
        header: 'editor',
        skipHeaderOnlyValidationWiring: true,
      },
    ]

    expect(() =>
      assertHeaderOnlyTabsHaveValidationWiring(tabs, { exemptTabIds: ['subclasses'] }),
    ).not.toThrow()
  })
})

describe('assertTabErrorPathCoverage', () => {
  it('passes when slot-owned paths are declared on errorPaths and resolverFields', () => {
    const tabs: TabbedFormTab[] = [
      {
        id: 'details',
        label: 'Details',
        fields: [{ kind: 'slot', name: '_nameSlot', render: () => null }],
        errorPaths: ['name'],
        resolverFields: [{ type: 'text', name: 'name', label: 'Name', required: true }],
      },
    ]

    expect(() =>
      assertTabErrorPathCoverage(tabs, { slotOwnedPaths: { details: ['name'] } }),
    ).not.toThrow()
  })

  it('fails when resolverFields are missing for a slot-owned path', () => {
    const tabs: TabbedFormTab[] = [
      {
        id: 'details',
        label: 'Details',
        fields: [{ kind: 'slot', name: '_nameSlot', render: () => null }],
        errorPaths: ['name'],
      },
    ]

    expect(() =>
      assertTabErrorPathCoverage(tabs, { slotOwnedPaths: { details: ['name'] } }),
    ).toThrow(/must declare resolverFields/)
  })
})
