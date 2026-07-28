import { describe, expect, it } from 'vitest'

import {
  applyOverviewAdvancedOpenPreferences,
  applyOverviewColumnChangePreferences,
} from './overview-preference-handlers'

describe('applyOverviewColumnChangePreferences', () => {
  it('updates visibility and order when the column state changes', () => {
    const current = {
      version: 1 as const,
      columnVisibility: { name: true },
      columnOrder: ['name'],
    }

    const result = applyOverviewColumnChangePreferences(current, {
      visibility: { name: false, level: true },
      order: ['level', 'name'],
    })

    expect(result.changed).toBe(true)
    expect(result.next).toEqual({
      version: 1,
      columnVisibility: { name: false, level: true },
      columnOrder: ['level', 'name'],
    })
  })

  it('returns unchanged preferences when the column state is equivalent', () => {
    const current = {
      version: 1 as const,
      columnVisibility: { name: true },
      columnOrder: ['name'],
    }

    const result = applyOverviewColumnChangePreferences(current, {
      visibility: { name: true },
      order: ['name'],
    })

    expect(result).toEqual({ next: current, changed: false })
  })
})

describe('applyOverviewAdvancedOpenPreferences', () => {
  it('toggles advancedOpen when the value changes', () => {
    const current = { version: 1 as const, advancedOpen: false }

    expect(applyOverviewAdvancedOpenPreferences(current, true)).toEqual({
      next: { version: 1, advancedOpen: true },
      changed: true,
    })
  })

  it('returns unchanged preferences when advancedOpen is already set', () => {
    const current = { version: 1 as const, advancedOpen: true }

    expect(applyOverviewAdvancedOpenPreferences(current, true)).toEqual({
      next: current,
      changed: false,
    })
  })
})
