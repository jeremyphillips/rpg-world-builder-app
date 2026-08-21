import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import {
  BuilderInventoryRemoveAction,
  formatBuilderInventoryRemoveLabel,
} from './builder-inventory-remove-action'

describe('BuilderInventoryRemoveAction', () => {
  it('renders an icon remove action with a default aria label', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()

    render(<BuilderInventoryRemoveAction itemLabel="Stealth" onRemove={onRemove} />)

    await user.click(
      screen.getByRole('button', { name: formatBuilderInventoryRemoveLabel('Stealth') }),
    )
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <BuilderInventoryRemoveAction itemLabel="DEX · Dexterity" onRemove={vi.fn()} />,
    )

    await expectNoAxeViolations(container)
  })
})
