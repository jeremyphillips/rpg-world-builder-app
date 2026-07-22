import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { ContentDeletionBlockedDialog } from './content-deletion-blocked-dialog.client'

describe('ContentDeletionBlockedDialog', () => {
  it('renders usage blockers as character links', async () => {
    render(
      <MemoryRouter>
        <ContentDeletionBlockedDialog
          open
          onOpenChange={vi.fn()}
          entityName="Custom Folk"
          blockers={[
            {
              kind: 'usage',
              usage: {
                kind: 'character',
                id: 'npc-1',
                label: 'Goblin Scout',
                characterType: 'npc',
                campaignId: 'camp-1',
              },
            },
          ]}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('dialog')).toHaveTextContent('Cannot delete Custom Folk')
    expect(screen.getByRole('link', { name: 'Goblin Scout' })).toHaveAttribute(
      'href',
      '/campaigns/camp-1/npcs/npc-1',
    )
  })

  it('closes from the Close action', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(
      <MemoryRouter>
        <ContentDeletionBlockedDialog
          open
          onOpenChange={onOpenChange}
          entityName="Custom Folk"
          blockers={[]}
        />
      </MemoryRouter>,
    )

    await user.click(screen.getAllByRole('button', { name: 'Close' })[0]!)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <ContentDeletionBlockedDialog
          open
          onOpenChange={vi.fn()}
          entityName="Custom Folk"
          blockers={[
            {
              kind: 'usage',
              usage: {
                kind: 'character',
                id: 'pc-1',
                label: 'Verna',
                characterType: 'pc',
              },
            },
          ]}
        />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})
