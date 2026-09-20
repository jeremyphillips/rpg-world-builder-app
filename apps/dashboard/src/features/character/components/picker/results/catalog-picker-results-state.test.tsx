import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { CatalogPickerResultsState } from './catalog-picker-results-state'

describe('CatalogPickerResultsState', () => {
  it('renders passive empty-state copy', () => {
    render(<CatalogPickerResultsState message="No options available." />)

    expect(screen.getByText('No options available.')).toBeInTheDocument()
  })

  itAxe('has no axe violations', async () => {
    const { container } = render(<CatalogPickerResultsState message="Selection full." />)

    await expectNoAxeViolations(container)
  })
})
