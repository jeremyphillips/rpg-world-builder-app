import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ActionIcon, Button } from '@rpg/ui'

import { DrawerShell } from './drawer-shell'

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
      <DrawerShell open onOpenChange={onOpenChange} title="Add item">
        <p>Drawer body</p>
      </DrawerShell>,
    )

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('suppresses aria-describedby when no description is provided', () => {
    render(
      <DrawerShell open onOpenChange={() => undefined} title="Add item">
        <p>Drawer body</p>
      </DrawerShell>,
    )

    expect(screen.getByRole('dialog', { name: 'Add item' })).not.toHaveAttribute('aria-describedby')
  })

  it('supports managed body mode for child-owned scroll regions', () => {
    render(
      <DrawerShell open bodyMode="managed" onOpenChange={() => undefined} title="Edit item">
        <div data-testid="managed-scroll">Managed content</div>
      </DrawerShell>,
    )

    expect(screen.getByTestId('managed-scroll')).toBeInTheDocument()
  })

  it('uses the background drawer plane by default', () => {
    render(
      <DrawerShell open onOpenChange={() => undefined} title="Add item">
        <p>Drawer body</p>
      </DrawerShell>,
    )

    expect(screen.getByRole('dialog', { name: 'Add item' })).toHaveClass('bg-background')
  })

  it('renders entityContext in a band below the title row and keeps description', () => {
    render(
      <DrawerShell
        open
        onOpenChange={() => undefined}
        title="Edit item"
        description="Task guidance"
        headerLeading={
          <span data-testid="back-icon">
            <ActionIcon action="back" />
          </span>
        }
        entityContext={<p data-testid="entity-band">Shortsword</p>}
      >
        <p>Drawer body</p>
      </DrawerShell>,
    )

    expect(screen.getByTestId('back-icon')).toBeInTheDocument()
    expect(screen.getByText('Task guidance')).toBeInTheDocument()
    const entityBand = screen.getByTestId('entity-band')
    expect(entityBand).toBeInTheDocument()
    expect(entityBand.closest('[class*="bg-surface-subtle"]')).toBeTruthy()
  })

  it('allows surface override', () => {
    render(
      <DrawerShell open surface="surface-lift" onOpenChange={() => undefined} title="Add item">
        <p>Drawer body</p>
      </DrawerShell>,
    )

    expect(screen.getByRole('dialog', { name: 'Add item' })).toHaveClass('bg-surface-lift')
    expect(screen.getByRole('dialog', { name: 'Add item' })).not.toHaveClass('bg-background')
  })
})
