import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { EquipmentInventoryColumn } from '../column/equipment-inventory-column'

describe('EquipmentInventoryColumn', () => {
  it('renders a subsection title and body content', () => {
    render(
      <EquipmentInventoryColumn title="Standard Equipment">
        <p>Package items</p>
      </EquipmentInventoryColumn>,
    )

    const heading = screen.getByRole('heading', { name: 'Standard Equipment', level: 3 })
    expect(heading).toHaveClass('heading-style-subsection')
    expect(screen.getByText('Package items')).toBeInTheDocument()
  })

  it('renders title actions and a toolbar row', () => {
    const { container } = render(
      <EquipmentInventoryColumn
        title="Purchased Equipment"
        titleActions={<button type="button">Browse</button>}
        toolbar={<div>Customize · Change option</div>}
      >
        <p>Purchased items</p>
      </EquipmentInventoryColumn>,
    )

    expect(screen.getByRole('button', { name: 'Browse' })).toBeInTheDocument()
    expect(screen.getByText('Customize · Change option')).toBeInTheDocument()
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument()
  })

  it('renders a toolbar spacer when reserveToolbarRow is set without a toolbar', () => {
    const { container } = render(
      <EquipmentInventoryColumn title="Purchased Equipment" reserveToolbarRow>
        <p>Purchased items</p>
      </EquipmentInventoryColumn>,
    )

    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('renders a count badge adjacent to the heading when titleBadgeCount is set', () => {
    render(
      <EquipmentInventoryColumn title="Added Equipment" titleBadgeCount={3}>
        <p>Added items</p>
      </EquipmentInventoryColumn>,
    )

    expect(screen.getByRole('heading', { name: 'Added Equipment' })).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <EquipmentInventoryColumn title="Standard Equipment">
        <p>Package items</p>
      </EquipmentInventoryColumn>,
    )

    await expectNoAxeViolations(container)
  })
})
