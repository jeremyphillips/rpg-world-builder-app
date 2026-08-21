import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { CatalogPickerResultsState } from './catalog-picker-results-state'

describe('CatalogPickerResultsState', () => {
  it('renders the message in a status region', () => {
    render(<CatalogPickerResultsState message="No options available." />)

    expect(screen.getByRole('status')).toHaveTextContent('No options available.')
  })

  itAxe('has no axe violations', async () => {
    const { container } = render(<CatalogPickerResultsState message="Selection full." />)

    await expectNoAxeViolations(container)
  })
})
