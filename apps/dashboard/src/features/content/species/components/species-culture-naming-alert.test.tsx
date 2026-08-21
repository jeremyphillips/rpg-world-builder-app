import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SpeciesCultureNamingAlert } from './species-culture-naming-alert'

describe('SpeciesCultureNamingAlert', () => {
  it('renders the homebrew naming warning', () => {
    render(<SpeciesCultureNamingAlert />)

    expect(screen.getByRole('alert')).toHaveTextContent('Name generation unavailable')
    expect(screen.getByText(/not yet supported for homebrew species/i)).toBeInTheDocument()
  })
})
