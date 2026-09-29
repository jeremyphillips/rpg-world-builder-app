import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ContentCreateSplitAction } from './content-create-split-action'

describe('ContentCreateSplitAction', () => {
  it('routes primary and scratch menu item to the same handler', async () => {
    const user = userEvent.setup()
    const onCreateFromScratch = vi.fn()

    render(
      <ContentCreateSplitAction
        entityLabel="location"
        primaryLabel="New location"
        onCreateFromScratch={onCreateFromScratch}
        onStartWithSetup={vi.fn()}
        onQuickCreate={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'New location' }))
    expect(onCreateFromScratch).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'New location options' }))
    await user.click(screen.getByRole('menuitem', { name: /Create from scratch/i }))
    expect(onCreateFromScratch).toHaveBeenCalledTimes(2)
  })

  it('invokes setup and quick handlers from the menu', async () => {
    const user = userEvent.setup()
    const onStartWithSetup = vi.fn()
    const onQuickCreate = vi.fn()

    render(
      <ContentCreateSplitAction
        entityLabel="NPC"
        primaryLabel="Create NPC"
        onCreateFromScratch={vi.fn()}
        onStartWithSetup={onStartWithSetup}
        onQuickCreate={onQuickCreate}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Create NPC options' }))
    await user.click(screen.getByRole('menuitem', { name: /Start with setup/i }))
    expect(onStartWithSetup).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Create NPC options' }))
    await user.click(screen.getByRole('menuitem', { name: /Quick create/i }))
    expect(onQuickCreate).toHaveBeenCalledTimes(1)
  })
})
