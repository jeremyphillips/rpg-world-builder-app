import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { LocationAddChildMenu } from './location-add-child-menu'

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

  it('intersects allowedAuthoringTypes with canonical parent eligibility', async () => {
    const user = userEvent.setup()
    const onSelectAuthoringType = vi.fn()

    render(
      <LocationAddChildMenu
        appearance="group"
        parentKind="settlement"
        allowedAuthoringTypes={['building', 'site', 'district']}
        onSelectAuthoringType={onSelectAuthoringType}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add location' }))
    expect(screen.getByRole('menuitem', { name: 'Building' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Site' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'District' })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Fortification' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('menuitem', { name: 'Building' }))
    expect(onSelectAuthoringType).toHaveBeenCalledWith('building')
  })

  it('returns null when the allowed subset has no canonical intersection', () => {
    const { container } = render(
      <LocationAddChildMenu
        parentKind="settlement"
        allowedAuthoringTypes={[]}
        onSelectAuthoringType={vi.fn()}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
