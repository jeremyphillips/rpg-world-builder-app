import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ProficiencyEquipmentLinkCue } from './proficiency-equipment-link-cue.client'

describe('ProficiencyEquipmentLinkCue', () => {
  it('renders equipment variant copy with the referenced choice label', () => {
    render(
      <ProficiencyEquipmentLinkCue
        variant="equipment"
        choiceLabel="Artisan's Tools or Musical Instrument"
      />,
    )

    expect(
      screen.getByText('Linked to "Artisan\'s Tools or Musical Instrument" below'),
    ).toBeInTheDocument()
  })

  it('renders proficiency variant copy with the package label', () => {
    render(
      <ProficiencyEquipmentLinkCue
        variant="proficiency"
        choiceLabel="Artisan's Tools or Musical Instrument"
        packageLabel="Standard Equipment"
      />,
    )

    expect(
      screen.getByText('The selected tool is also granted by the Standard Equipment option.'),
    ).toBeInTheDocument()
  })

  it('invokes onNavigate when the action is clicked', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()

    render(
      <ProficiencyEquipmentLinkCue
        variant="equipment"
        choiceLabel="Artisan's Tools or Musical Instrument"
        onNavigate={onNavigate}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'View choice' }))
    expect(onNavigate).toHaveBeenCalledOnce()
  })
})
