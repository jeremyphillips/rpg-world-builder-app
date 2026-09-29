import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { LocationAddChildMenu } from '../location-add-child-menu'

describe('LocationAddChildMenu', () => {
  it('calls onSelectAuthoringType instead of navigating', async () => {
    const user = userEvent.setup()
    const onSelectAuthoringType = vi.fn()

    render(
      <LocationAddChildMenu
        parentKind="settlement"
        parentAuthoringType="settlement"
        onSelectAuthoringType={onSelectAuthoringType}
      />,
    )

    const addButton = screen.getByRole('button', { name: /add location/i })
    expect(addButton).toHaveClass('text-action-standalone', 'text-foreground')

    await user.click(addButton)
    await user.click(screen.getByRole('menuitem', { name: /Building/i }))

    expect(onSelectAuthoringType).toHaveBeenCalledWith('building')
  })

  it('renders an icon trigger with required accessible name and optional menu heading', async () => {
    const user = userEvent.setup()
    const onSelectAuthoringType = vi.fn()

    render(
      <LocationAddChildMenu
        appearance="icon"
        parentKind="district"
        parentAuthoringType="district"
        triggerLabel="Add location to Dock Ward"
        menuHeading="Add to Dock Ward"
        onSelectAuthoringType={onSelectAuthoringType}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add location to Dock Ward' }))
    expect(screen.getByText('Add to Dock Ward')).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'District' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('menuitem', { name: /Building/i }))
    expect(onSelectAuthoringType).toHaveBeenCalledWith('building')
  })

  it('intersects allowedAuthoringTypes with canonical parent eligibility', async () => {
    const user = userEvent.setup()
    const onSelectAuthoringType = vi.fn()

    render(
      <LocationAddChildMenu
        appearance="group"
        parentKind="settlement"
        parentAuthoringType="settlement"
        allowedAuthoringTypes={['building', 'site', 'district']}
        onSelectAuthoringType={onSelectAuthoringType}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add location' }))
    expect(screen.getByRole('menuitem', { name: /Building/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /^Site\b/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /^District\b/i })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Fortification' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('menuitem', { name: /Building/i }))
    expect(onSelectAuthoringType).toHaveBeenCalledWith('building')
  })

  it('shows contextual description for building under building', async () => {
    const user = userEvent.setup()

    render(
      <LocationAddChildMenu
        parentKind="structure"
        parentAuthoringType="building"
        onSelectAuthoringType={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: /add location/i }))
    expect(screen.getByText(/annex, tower, stable, or workshop/i)).toBeInTheDocument()
  })

  it('shows building description under site parent', async () => {
    const user = userEvent.setup()

    render(
      <LocationAddChildMenu
        parentKind="site"
        parentAuthoringType="site"
        onSelectAuthoringType={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: /add location/i }))
    expect(screen.getByText(/annex, tower, stable, or workshop/i)).toBeInTheDocument()
  })

  it('returns null when the allowed subset has no canonical intersection', () => {
    const { container } = render(
      <LocationAddChildMenu
        parentKind="settlement"
        parentAuthoringType="settlement"
        allowedAuthoringTypes={[]}
        onSelectAuthoringType={vi.fn()}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
