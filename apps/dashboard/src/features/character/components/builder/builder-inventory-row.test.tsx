import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { Text } from '@rpg/ui'

import { BuilderInventoryRow } from './builder-inventory-row.client'

describe('BuilderInventoryRow', () => {
  it('renders label, source, and remove action', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()

    render(
      <BuilderInventoryRow
        label={<Text as="span">Stealth</Text>}
        sourceLabel="Chosen from Rogue Skills"
        onRemove={onRemove}
      />,
    )

    expect(screen.getByText('Stealth')).toBeInTheDocument()
    expect(screen.getByText('Chosen from Rogue Skills')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remove' }))
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <BuilderInventoryRow
        label={<Text as="span">DEX · Dexterity</Text>}
        sourceLabel="Granted by Rogue"
      />,
    )

    await expectNoAxeViolations(container)
  })
})
