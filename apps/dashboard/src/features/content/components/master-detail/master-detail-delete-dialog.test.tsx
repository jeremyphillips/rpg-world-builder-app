import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { MasterDetailDeleteDialog } from './master-detail-delete-dialog'

describe('MasterDetailDeleteDialog', () => {
  it('renders the noun and name and confirms', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <MasterDetailDeleteDialog
        open
        itemNoun="feature"
        itemName="Rage"
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
      />,
    )

    expect(screen.getByRole('alertdialog')).toHaveTextContent('Delete feature?')
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Rage')

    await user.click(screen.getByRole('button', { name: /^Delete$/ }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('does not render when closed', () => {
    render(
      <MasterDetailDeleteDialog
        open={false}
        itemNoun="feature"
        itemName="Rage"
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })
})
