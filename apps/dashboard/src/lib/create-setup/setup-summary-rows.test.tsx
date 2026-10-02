import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SetupSummaryRows } from './setup-summary-rows'

const rows = [
  { id: 'role', label: 'Role', value: 'Scout', targetSetId: 'role' },
  { id: 'species', label: 'Species', value: 'Gnome', targetSetId: 'species' },
  { id: 'build', label: 'Build', value: 'Level 1 Ranger', targetSetId: 'build' },
]

describe('SetupSummaryRows', () => {
  it('keeps the active row visible without Change and leaves Change on the others', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()

    render(
      <SetupSummaryRows
        eyebrow="Selections"
        rows={rows}
        activeTargetId="species"
        onNavigate={onNavigate}
      />,
    )

    expect(screen.getByText('Scout')).toBeInTheDocument()
    expect(screen.getByText('Gnome')).toBeInTheDocument()
    expect(screen.getByText('Level 1 Ranger')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change role' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Change species' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change build' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Change build' }))
    expect(onNavigate).toHaveBeenCalledWith('build')
  })

  it('gives every row Change when no editor is active', () => {
    render(<SetupSummaryRows eyebrow="Setup" rows={rows} onNavigate={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Change role' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change species' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change build' })).toBeInTheDocument()
  })
})
