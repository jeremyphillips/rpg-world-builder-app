/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { ActionDialogShell } from './action-dialog-shell.client'

describe('ActionDialogShell', () => {
  it('renders configure phase actions', () => {
    render(
      <ActionDialogShell
        open
        onOpenChange={vi.fn()}
        phase="configure"
        headline="Edit availability"
        configureSlot={<p>Configure form</p>}
        onConfigureApply={vi.fn()}
      />,
    )

    expect(screen.getByText('Configure form')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apply changes' })).toBeInTheDocument()
  })

  it('renders resolve phase with lighter resolution list', () => {
    render(
      <ActionDialogShell
        open
        onOpenChange={vi.fn()}
        phase="resolve"
        headline="Edit availability"
        confirmedCount={1}
        resolveNoun="items"
        resolutionRows={[
          {
            targetId: 'a',
            targetName: 'Alpha',
            state: 'eligible',
            checked: true,
            disabled: false,
          },
        ]}
        onResolveConfirm={vi.fn()}
        onResolveBack={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect(document.querySelector('.bg-surface-subtle')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations in resolve phase', async () => {
    const { container } = render(
      <ActionDialogShell
        open
        onOpenChange={vi.fn()}
        phase="resolve"
        headline="Edit availability"
        confirmedCount={1}
        resolutionRows={[
          {
            targetId: 'a',
            targetName: 'Alpha',
            state: 'eligible',
            checked: true,
            disabled: false,
          },
        ]}
        onResolveConfirm={vi.fn()}
        onResolveBack={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
