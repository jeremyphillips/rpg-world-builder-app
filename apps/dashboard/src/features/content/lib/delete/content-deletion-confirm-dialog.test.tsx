import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { ContentDeletionConfirmDialog } from './content-deletion-confirm-dialog.client'

describe('ContentDeletionConfirmDialog', () => {
  it('renders destructive confirm copy', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(
      <ContentDeletionConfirmDialog
        open
        onOpenChange={vi.fn()}
        contentTypeKey="species"
        entityName="Custom Folk"
        onConfirm={onConfirm}
      />,
    )

    expect(screen.getByRole('alertdialog')).toHaveTextContent('Delete Custom Folk?')
    expect(screen.getByRole('button', { name: 'Delete species' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete species' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <ContentDeletionConfirmDialog
        open
        onOpenChange={vi.fn()}
        contentTypeKey="species"
        entityName="Custom Folk"
        onConfirm={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
