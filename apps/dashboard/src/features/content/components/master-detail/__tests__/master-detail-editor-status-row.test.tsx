import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { buildMasterDetailAvailabilityPresentation } from '../../../lib/master-detail/master-detail-availability.types'
import { MasterDetailEditorStatusRow } from '../master-detail-editor-status-row'

describe('MasterDetailEditorStatusRow', () => {
  it('renders availability and issue count on one row', () => {
    render(
      <MasterDetailEditorStatusRow
        availability={buildMasterDetailAvailabilityPresentation('sub-1', true)}
        onAvailabilityChange={vi.fn()}
        issueCount={2}
      />,
    )

    expect(screen.getByText('Available')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument()
    expect(screen.getByText('2 issues')).toBeInTheDocument()
  })

  it('renders issue count without availability', () => {
    render(<MasterDetailEditorStatusRow issueCount={1} />)

    expect(screen.getByText('1 issue')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Change' })).not.toBeInTheDocument()
  })

  it('calls onAvailabilityChange when Change is clicked', async () => {
    const user = userEvent.setup()
    const onAvailabilityChange = vi.fn()

    render(
      <MasterDetailEditorStatusRow
        availability={buildMasterDetailAvailabilityPresentation('sub-1', false)}
        onAvailabilityChange={onAvailabilityChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Change' }))
    expect(onAvailabilityChange).toHaveBeenCalledOnce()
  })
})
