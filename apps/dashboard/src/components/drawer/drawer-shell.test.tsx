import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '@rpg/ui'

import { DrawerShell } from './drawer-shell.client'

describe('DrawerShell', () => {
  it('renders title and body when open', () => {
    render(
      <DrawerShell open onOpenChange={() => undefined} title="Add item">
        <p>Drawer body</p>
      </DrawerShell>,
    )

    expect(screen.getByRole('dialog', { name: 'Add item' })).toBeInTheDocument()
    expect(screen.getByText('Drawer body')).toBeInTheDocument()
  })

  it('renders optional description and footer', () => {
    render(
      <DrawerShell
        open
        onOpenChange={() => undefined}
        title="Add item"
        description="Helper copy"
        footer={<Button>Save</Button>}
      >
        <p>Drawer body</p>
      </DrawerShell>,
    )

    expect(screen.getByText('Helper copy')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('closes via DrawerShell.Close', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(
      <DrawerShell
        open
        onOpenChange={onOpenChange}
        title="Add item"
        footer={
          <DrawerShell.Close asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerShell.Close>
        }
      >
        <p>Drawer body</p>
      </DrawerShell>,
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('forwards controlled open changes from the close control', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(
      <DrawerShell open onOpenChange={onOpenChange} title="Add item">
        <p>Drawer body</p>
      </DrawerShell>,
    )

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('supports managed body mode for child-owned scroll regions', () => {
    render(
      <DrawerShell open bodyMode="managed" onOpenChange={() => undefined} title="Edit item">
        <div data-testid="managed-scroll">Managed content</div>
      </DrawerShell>,
    )

    expect(screen.getByTestId('managed-scroll')).toBeInTheDocument()
  })
})
