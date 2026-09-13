import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { buildMasterDetailAvailabilityPresentation } from '../../lib/master-detail/master-detail-availability.types'
import { MasterDetailAvailabilityHeaderLine } from './master-detail-availability-header-line'

describe('MasterDetailAvailabilityHeaderLine', () => {
  it('renders broad available copy without player-access detail', () => {
    render(
      <MasterDetailAvailabilityHeaderLine
        availability={buildMasterDetailAvailabilityPresentation('sub-1', true)}
        onAvailabilityChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Available')).toBeInTheDocument()
    expect(screen.queryByText(/All players/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument()
  })

  it('calls onAvailabilityChange when Change is clicked', async () => {
    const user = userEvent.setup()
    const onAvailabilityChange = vi.fn()

    render(
      <MasterDetailAvailabilityHeaderLine
        availability={buildMasterDetailAvailabilityPresentation('sub-1', false)}
        onAvailabilityChange={onAvailabilityChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Change' }))
    expect(onAvailabilityChange).toHaveBeenCalledOnce()
  })
})
