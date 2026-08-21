import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ProficiencyEquipmentLinkCue } from './proficiency-equipment-link-cue.client'

describe('ProficiencyEquipmentLinkCue', () => {
  it('renders the provided message', () => {
    render(
      <ProficiencyEquipmentLinkCue
        message={'Linked to "Artisan\'s Tools or Musical Instrument" below'}
      />,
    )

    expect(
      screen.getByText('Linked to "Artisan\'s Tools or Musical Instrument" below'),
    ).toBeInTheDocument()
  })

  it('invokes onNavigate when the action is clicked', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()

    render(
      <ProficiencyEquipmentLinkCue
        message={'Linked to "Artisan\'s Tools or Musical Instrument" below'}
        onNavigate={onNavigate}
        navigateLabel="View choice"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'View choice' }))
    expect(onNavigate).toHaveBeenCalledOnce()
  })
})
