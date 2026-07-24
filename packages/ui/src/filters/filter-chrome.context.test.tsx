import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  FilterChromeProvider,
  useFilterChrome,
  useOptionalFilterChrome,
} from './filter-chrome.context'
import { resolveFilterChromePresentation } from './filter-presentation.lib'

function ReadChrome() {
  const chrome = useFilterChrome()
  const presentation = resolveFilterChromePresentation(chrome)
  return (
    <div>
      <span data-testid="density">{chrome.density}</span>
      <span data-testid="label" className={presentation.labelClassName} />
      <span data-testid="control">{presentation.controlSize}</span>
    </div>
  )
}

function ReadOptionalChrome() {
  const chrome = useOptionalFilterChrome()
  return <span data-testid="optional">{chrome?.density ?? 'none'}</span>
}

describe('FilterChromeProvider', () => {
  it('defaults to compact density outside a provider', () => {
    render(<ReadChrome />)
    expect(screen.getByTestId('density')).toHaveTextContent('compact')
    expect(screen.getByTestId('label')).toHaveClass('text-xs')
    expect(screen.getByTestId('control')).toHaveTextContent('sm')
  })

  it('inherits parent density when child omits override', () => {
    render(
      <FilterChromeProvider density="comfortable">
        <ReadChrome />
      </FilterChromeProvider>,
    )

    expect(screen.getByTestId('density')).toHaveTextContent('comfortable')
    expect(screen.getByTestId('label')).toHaveClass('text-sm')
    expect(screen.getByTestId('control')).toHaveTextContent('md')
  })

  it('allows nested override density', () => {
    render(
      <FilterChromeProvider density="compact">
        <FilterChromeProvider density="comfortable">
          <ReadChrome />
        </FilterChromeProvider>
      </FilterChromeProvider>,
    )

    expect(screen.getByTestId('density')).toHaveTextContent('comfortable')
  })

  it('returns undefined from useOptionalFilterChrome outside provider', () => {
    render(<ReadOptionalChrome />)
    expect(screen.getByTestId('optional')).toHaveTextContent('none')
  })
})
