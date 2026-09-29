import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { EntityActionChoiceMenu } from './entity-action-choice-menu'
import { entityActionChoiceMenuContentClasses } from './entity-action-choice-menu.variants'

describe('EntityActionChoiceMenu', () => {
  it('renders labeled trigger and invokes onSelect with descriptions visible', async () => {
    const user = userEvent.setup()
    const onSelectA = vi.fn()

    render(
      <EntityActionChoiceMenu
        triggerLabel="Add item"
        items={[
          {
            id: 'a',
            label: 'Option A',
            description: 'Helper for A',
            onSelect: onSelectA,
          },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add item' }))
    expect(screen.getByText('Helper for A')).toBeInTheDocument()
    await user.click(screen.getByRole('menuitem', { name: /Option A/i }))
    expect(onSelectA).toHaveBeenCalledTimes(1)
  })

  it('applies viewport-safe choice menu width class on content', async () => {
    const user = userEvent.setup()

    render(
      <EntityActionChoiceMenu
        items={[
          {
            id: 'a',
            label: 'Option A',
            description: 'Helper',
            onSelect: vi.fn(),
          },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: /add/i }))
    expect(screen.getByRole('menu')).toHaveClass(entityActionChoiceMenuContentClasses)
  })
})
