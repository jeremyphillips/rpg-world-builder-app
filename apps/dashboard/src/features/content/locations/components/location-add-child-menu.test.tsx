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

  it('renders an icon trigger with required accessible name and optional menu heading', async () => {
    const user = userEvent.setup()
    const onSelectAuthoringType = vi.fn()

    render(
      <LocationAddChildMenu
        appearance="icon"
        parentKind="district"
        triggerLabel="Add location to Dock Ward"
        menuHeading="Add to Dock Ward"
        onSelectAuthoringType={onSelectAuthoringType}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add location to Dock Ward' }))
    expect(screen.getByText('Add to Dock Ward')).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'District' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('menuitem', { name: 'Building' }))
    expect(onSelectAuthoringType).toHaveBeenCalledWith('building')
  })
})
