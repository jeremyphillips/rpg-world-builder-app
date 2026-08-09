import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Button } from './button.client'
import { ConfirmDialog } from './confirm-dialog.client'
import { DialogPanelHeader } from './dialog-parts.client'
import { headingVariants } from './heading.variants'
import { Modal } from './modal.client'
import { Sheet } from './sheet.client'

const globalsCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../../styles/globals.css'),
  'utf8',
)

describe('dialog title typography ownership', () => {
  it('maps dialogTitle to the shared responsive utility', () => {
    expect(headingVariants({ variant: 'dialogTitle' })).toBe('heading-style-dialog-title')
  })

  it('defines dialogTitle as 19px base with 24px from the md breakpoint', () => {
    expect(globalsCss).toMatch(/--text-heading-dialog-title:\s*var\(--text-heading-subsection\)/)
    expect(globalsCss).toMatch(/--text-heading-dialog-title-md:\s*var\(--text-heading-3-md\)/)
    expect(globalsCss).toMatch(
      /@utility heading-style-dialog-title \{[\s\S]*?@media \(width >= 48rem\) \{[\s\S]*?--text-heading-dialog-title-md/,
    )
  })

  it('defaults DialogPanelHeader to dialogTitle', async () => {
    const user = userEvent.setup()
    render(
      <Modal.Root>
        <Modal.Trigger asChild>
          <Button>Open</Button>
        </Modal.Trigger>
        <Modal.Content>
          <DialogPanelHeader headline="Panel title" />
          <Modal.Body>Body</Modal.Body>
        </Modal.Content>
      </Modal.Root>,
    )
    await user.click(screen.getByRole('button', { name: 'Open' }))
    expect(await screen.findByText('Panel title')).toHaveClass('heading-style-dialog-title')
  })

  it('lets Modal.Header inherit the shared DialogPanelHeader default', async () => {
    const user = userEvent.setup()
    render(
      <Modal.Root>
        <Modal.Trigger asChild>
          <Button>Open</Button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Header headline="Invite a player" />
          <Modal.Body>Body</Modal.Body>
        </Modal.Content>
      </Modal.Root>,
    )
    await user.click(screen.getByRole('button', { name: 'Open' }))
    expect(await screen.findByText('Invite a player')).toHaveClass('heading-style-dialog-title')
  })

  it('lets Sheet.Header inherit the same shared default without injecting sheetTitle', async () => {
    const user = userEvent.setup()
    render(
      <Sheet.Root>
        <Sheet.Trigger asChild>
          <Button>Open sheet</Button>
        </Sheet.Trigger>
        <Sheet.Content>
          <Sheet.Header headline="Edit entry" />
          <Sheet.Body>Body</Sheet.Body>
        </Sheet.Content>
      </Sheet.Root>,
    )
    await user.click(screen.getByRole('button', { name: 'Open sheet' }))
    const headline = await screen.findByText('Edit entry')
    expect(headline).toHaveClass('heading-style-dialog-title')
    expect(headline).not.toHaveClass('heading-style-sheet-title')
  })

  it('still allows explicit headlineClassName overrides', async () => {
    const user = userEvent.setup()
    render(
      <Modal.Root>
        <Modal.Trigger asChild>
          <Button>Open</Button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Header
            headline="Compact title"
            headlineClassName={headingVariants({ variant: 'card' })}
          />
          <Modal.Body>Body</Modal.Body>
        </Modal.Content>
      </Modal.Root>,
    )
    await user.click(screen.getByRole('button', { name: 'Open' }))
    const headline = await screen.findByText('Compact title')
    expect(headline).toHaveClass('heading-style-card')
    expect(headline).not.toHaveClass('heading-style-dialog-title')
  })

  it('keeps ConfirmDialog on the compact confirmDialogTitle style', () => {
    render(
      <ConfirmDialog
        open
        onOpenChange={() => undefined}
        headline="Delete campaign?"
        onConfirm={() => undefined}
      />,
    )
    expect(screen.getByText('Delete campaign?')).toHaveClass('heading-style-confirm-dialog-title')
    expect(screen.getByText('Delete campaign?')).not.toHaveClass('heading-style-dialog-title')
  })
})
