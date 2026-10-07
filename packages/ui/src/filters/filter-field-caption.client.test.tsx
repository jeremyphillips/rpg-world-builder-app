import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FilterFieldCaption } from './filter-field-caption.client'
import { FilterChromeProvider } from './filter-chrome.context'

describe('FilterFieldCaption', () => {
  it('renders a span with compact caption classes by default', () => {
    render(<FilterFieldCaption>Equipment kind</FilterFieldCaption>)

    const caption = screen.getByText('Equipment kind')
    expect(caption.tagName).toBe('SPAN')
    expect(caption).toHaveClass('text-xs', 'text-muted-foreground')
  })

  it('renders a label associated with its control', () => {
    render(
      <FilterFieldCaption as="label" htmlFor="kind-control">
        Equipment kind
      </FilterFieldCaption>,
    )

    const caption = screen.getByText('Equipment kind')
    expect(caption.tagName).toBe('LABEL')
    expect(caption).toHaveAttribute('for', 'kind-control')
  })

  it('uses comfortable caption classes from filter chrome', () => {
    render(
      <FilterChromeProvider density="comfortable">
        <FilterFieldCaption id="kind-label">Equipment kind</FilterFieldCaption>
      </FilterChromeProvider>,
    )

    const caption = screen.getByText('Equipment kind')
    expect(caption).toHaveAttribute('id', 'kind-label')
    expect(caption).toHaveClass('text-sm', 'text-muted-foreground')
    expect(caption).not.toHaveClass('text-xs')
  })

  it('lets an explicit density override inherited chrome', () => {
    render(
      <FilterChromeProvider density="compact">
        <FilterFieldCaption density="comfortable">Equipment kind</FilterFieldCaption>
      </FilterChromeProvider>,
    )

    expect(screen.getByText('Equipment kind')).toHaveClass('text-sm')
  })
})
