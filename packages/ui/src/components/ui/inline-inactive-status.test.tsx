import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { InlineInactiveStatus } from './inline-inactive-status.client'

describe('InlineInactiveStatus', () => {
  it('renders the inactive indicator label', () => {
    render(<InlineInactiveStatus label="Unavailable" />)

    expect(screen.getByText('Unavailable')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<InlineInactiveStatus label="Unavailable" />)

    await expectNoAxeViolations(container)
  })
})
