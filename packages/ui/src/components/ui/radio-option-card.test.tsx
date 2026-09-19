import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { RadioGroup } from './radio-group.client'
import { RadioOptionCard, RadioOptionCardDetailsAction } from './radio-option-card.client'

describe('RadioOptionCard titleEndSlot interactions', () => {
  it('opens details without selecting the card', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const onDetails = vi.fn()

    render(
      <RadioGroup aria-label="Species" value="" onValueChange={onValueChange}>
        <RadioOptionCard
          value="dwarf"
          label="Dwarf"
          description="Humanoid"
          density="compact"
          titleEndSlot={<RadioOptionCardDetailsAction label="Details" onDetails={onDetails} />}
        />
      </RadioGroup>,
    )

    await user.click(screen.getByRole('button', { name: 'Details' }))
    expect(onDetails).toHaveBeenCalledTimes(1)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('does not activate the radio item when Enter is pressed on the details button', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const onDetails = vi.fn()

    render(
      <RadioGroup aria-label="Species" value="" onValueChange={onValueChange}>
        <RadioOptionCard
          value="dwarf"
          label="Dwarf"
          density="compact"
          titleEndSlot={<RadioOptionCardDetailsAction label="Details" onDetails={onDetails} />}
        />
      </RadioGroup>,
    )

    const detailsButton = screen.getByRole('button', { name: 'Details' })
    detailsButton.focus()
    await user.keyboard('{Enter}')

    expect(onDetails).toHaveBeenCalledTimes(1)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('does not activate the radio item when Space is pressed on the details button', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const onDetails = vi.fn()

    render(
      <RadioGroup aria-label="Species" value="" onValueChange={onValueChange}>
        <RadioOptionCard
          value="dwarf"
          label="Dwarf"
          density="compact"
          titleEndSlot={<RadioOptionCardDetailsAction label="Details" onDetails={onDetails} />}
        />
      </RadioGroup>,
    )

    const detailsButton = screen.getByRole('button', { name: 'Details' })
    detailsButton.focus()
    await user.keyboard(' ')

    expect(onDetails).toHaveBeenCalledTimes(1)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('still selects the card when clicking the card body', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <RadioGroup aria-label="Species" value="" onValueChange={onValueChange}>
        <RadioOptionCard
          value="dwarf"
          label="Dwarf"
          description="Humanoid"
          density="compact"
          titleEndSlot={<RadioOptionCardDetailsAction label="Details" onDetails={vi.fn()} />}
        />
      </RadioGroup>,
    )

    await user.click(screen.getByRole('radio', { name: /Dwarf/i }))
    expect(onValueChange).toHaveBeenCalledWith('dwarf')
  })
})
