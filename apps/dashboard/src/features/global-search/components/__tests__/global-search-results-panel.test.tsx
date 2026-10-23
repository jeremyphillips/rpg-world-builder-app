import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { GlobalSearchResultsPanel } from '../global-search-results-panel'

describe('GlobalSearchResultsPanel', () => {
  it('renders quiet bleed panel chrome', () => {
    const { container } = render(<GlobalSearchResultsPanel>Results</GlobalSearchResultsPanel>)

    expect(container.firstElementChild).toHaveClass(
      'ui-panel',
      'ui-panel--quiet',
      'ui-panel--bleed',
    )
    expect(container.firstElementChild).not.toHaveClass('ui-panel--transparent')
  })

  it('forwards native attributes and roles', () => {
    render(
      <GlobalSearchResultsPanel id="preview" role="region" aria-label="Search results">
        Results
      </GlobalSearchResultsPanel>,
    )

    const panel = document.getElementById('preview')
    expect(panel).toHaveAttribute('role', 'region')
    expect(panel).toHaveAttribute('aria-label', 'Search results')
  })
})
