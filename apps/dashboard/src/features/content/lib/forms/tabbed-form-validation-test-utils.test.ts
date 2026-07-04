import { describe, expect, it } from 'vitest'
import type { TabbedFormTab } from '@rpg/ui/form'

import { assertHeaderOnlyTabsHaveValidationWiring } from './tabbed-form-validation-test-utils'

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

    expect(() => assertHeaderOnlyTabsHaveValidationWiring(tabs)).toThrow(
      /must declare errorPaths/,
    )
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
