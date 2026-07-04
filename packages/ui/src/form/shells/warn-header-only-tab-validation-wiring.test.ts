import { describe, expect, it } from 'vitest'
import type { TabbedFormTab } from '@rpg/ui/form'

import {
  collectHeaderOnlyTabValidationWiringWarnings,
  warnHeaderOnlyTabValidationWiring,
} from './warn-header-only-tab-validation-wiring'

describe('collectHeaderOnlyTabValidationWiringWarnings', () => {
  it('returns no warnings for header-only tabs with full wiring', () => {
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

    expect(collectHeaderOnlyTabValidationWiringWarnings(tabs)).toEqual([])
  })

  it('warns when both errorPaths and resolverFields are missing', () => {
    const tabs: TabbedFormTab[] = [
      { id: 'traits', label: 'Traits', fields: [], header: 'editor' },
    ]

    expect(collectHeaderOnlyTabValidationWiringWarnings(tabs)).toEqual([
      'Header-only tab "Traits" has no fields. Add errorPaths and resolverFields so tab badges and validation messages can resolve embedded errors.',
    ])
  })

  it('warns specifically when only errorPaths is missing', () => {
    const tabs: TabbedFormTab[] = [
      {
        id: 'traits',
        label: 'Traits',
        fields: [],
        header: 'editor',
        resolverFields: [{ type: 'text', name: 'traits', label: 'Traits', required: true }],
      },
    ]

    expect(collectHeaderOnlyTabValidationWiringWarnings(tabs)).toEqual([
      'Missing errorPaths on header-only tab "Traits": tab badges and footer summary will not include this tab.',
    ])
  })

  it('warns specifically when only resolverFields is missing', () => {
    const tabs: TabbedFormTab[] = [
      {
        id: 'traits',
        label: 'Traits',
        fields: [],
        header: 'editor',
        errorPaths: ['traits'],
      },
    ]

    expect(collectHeaderOnlyTabValidationWiringWarnings(tabs)).toEqual([
      'Missing resolverFields on header-only tab "Traits": validation copy may fall back to generic or Zod messages.',
    ])
  })

  it('skips tabs with skipHeaderOnlyValidationWiring', () => {
    const tabs: TabbedFormTab[] = [
      {
        id: 'subclasses',
        label: 'Subclasses',
        fields: [],
        header: 'editor',
        skipHeaderOnlyValidationWiring: true,
      },
    ]

    expect(collectHeaderOnlyTabValidationWiringWarnings(tabs)).toEqual([])
  })

  it('ignores tabs with rendered fields', () => {
    const tabs: TabbedFormTab[] = [
      {
        id: 'basics',
        label: 'Basics',
        fields: [{ type: 'text', name: 'name', label: 'Name', required: true }],
        header: 'intro',
      },
    ]

    expect(collectHeaderOnlyTabValidationWiringWarnings(tabs)).toEqual([])
  })
})

describe('warnHeaderOnlyTabValidationWiring', () => {
  it('does not warn outside development', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const env = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    warnHeaderOnlyTabValidationWiring([
      { id: 'traits', label: 'Traits', fields: [], header: 'editor' },
    ])

    expect(warnSpy).not.toHaveBeenCalled()

    process.env.NODE_ENV = env
    warnSpy.mockRestore()
  })
})
