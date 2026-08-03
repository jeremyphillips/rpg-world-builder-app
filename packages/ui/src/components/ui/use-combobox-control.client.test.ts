/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'

import { useComboboxControl } from './use-combobox-control.client'

const options = [
  { value: 'alpha', label: 'Alpha' },
  { value: 'beta', label: 'Beta' },
  { value: 'gamma', label: 'Gamma' },
]

const baseProps = {
  label: 'Test',
  options,
  multiple: false as const,
  selected: [] as string[],
  size: 'md' as const,
  placeholder: 'Choose…',
  emptyMessage: 'None',
}

describe('useComboboxControl', () => {
  it('keeps default filterOptions order when resolveFilteredOptions is omitted', () => {
    const { result } = renderHook(() => useComboboxControl(baseProps))
    expect(result.current.filteredOptions).toEqual(options)
  })

  it('uses resolveFilteredOptions when provided', () => {
    const resolveFilteredOptions = (opts: typeof options) => [...opts].reverse()
    const { result } = renderHook(() =>
      useComboboxControl({ ...baseProps, resolveFilteredOptions }),
    )
    expect(result.current.filteredOptions).toEqual([...options].reverse())
  })
})
