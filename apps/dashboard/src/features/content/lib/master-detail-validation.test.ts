import { describe, expect, it, vi } from 'vitest'

import { showMasterDetailUnselectedRowErrors } from './master-detail-validation'

function editor(overrides: {
  fields?: Array<{ id: string }>
  selectedIndex?: number | null
  hasRowError?: (index: number) => boolean
}) {
  return {
    fields: overrides.fields ?? [{ id: 'a' }, { id: 'b' }],
    selectedIndex: overrides.selectedIndex ?? 0,
    hasRowError: overrides.hasRowError ?? vi.fn(() => false),
  }
}

describe('showMasterDetailUnselectedRowErrors', () => {
  it('returns false before any submit attempt', () => {
    const hasRowError = vi.fn(() => true)
    expect(showMasterDetailUnselectedRowErrors(editor({ hasRowError }), 0)).toBe(false)
  })

  it('returns false when no rows have errors', () => {
    expect(showMasterDetailUnselectedRowErrors(editor({}), 1)).toBe(false)
  })

  it('returns false when only the selected row has errors', () => {
    const hasRowError = vi.fn((index: number) => index === 0)
    expect(showMasterDetailUnselectedRowErrors(editor({ selectedIndex: 0, hasRowError }), 1)).toBe(
      false,
    )
  })

  it('returns true when an unselected row has errors after submit', () => {
    const hasRowError = vi.fn((index: number) => index === 1)
    expect(showMasterDetailUnselectedRowErrors(editor({ selectedIndex: 0, hasRowError }), 1)).toBe(
      true,
    )
  })

  it('returns true when errors exist and nothing is selected', () => {
    const hasRowError = vi.fn(() => true)
    expect(
      showMasterDetailUnselectedRowErrors(
        editor({ fields: [], selectedIndex: null, hasRowError }),
        1,
      ),
    ).toBe(false)

    expect(
      showMasterDetailUnselectedRowErrors(editor({ selectedIndex: null, hasRowError }), 1),
    ).toBe(true)
  })
})
