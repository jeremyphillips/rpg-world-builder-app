import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { LocationAddChildMenu } from './location-add-child-menu.client'

describe('LocationAddChildMenu', () => {
  it('calls onSelectAuthoringType instead of navigating', async () => {
    const user = userEvent.setup()
    const onSelectAuthoringType = vi.fn()

    render(
      <LocationAddChildMenu
        parentKind="settlement"
        onSelectAuthoringType={onSelectAuthoringType}
      />,
    )

    await user.click(screen.getByRole('button', { name: /add location/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Building' }))

    expect(onSelectAuthoringType).toHaveBeenCalledWith('building')
  })
})
