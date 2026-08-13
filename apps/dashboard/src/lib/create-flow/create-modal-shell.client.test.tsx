/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { CreateModalShell } from './create-modal-shell.client'

describe('CreateModalShell', () => {
  it('selects the stable Modal layout and owns one body, scroll region, and footer', () => {
    render(
      <CreateModalShell
        open
        onOpenChange={vi.fn()}
        headline="Create place"
        footer={<button type="button">Create</button>}
      >
        <p>Details</p>
      </CreateModalShell>,
    )

    expect(screen.getByRole('dialog')).toHaveClass('h-[min(85vh,40rem)]')
    expect(document.querySelectorAll('[data-create-modal-body]')).toHaveLength(1)
    expect(document.querySelectorAll('[data-create-modal-content]')).toHaveLength(1)
    expect(document.querySelector('[data-create-modal-content]')).toHaveClass('overflow-y-auto')
    expect(document.querySelectorAll('[data-create-modal-footer]')).toHaveLength(1)
  })

  it('keeps inactive tab content mounted and reports normalized panel issues', async () => {
    const user = userEvent.setup()
    render(
      <CreateModalShell
        open
        onOpenChange={vi.fn()}
        headline="Create building"
        tabs={[
          {
            id: 'details',
            label: 'Details',
            content: <input aria-label="Building name" defaultValue="Old Mill" />,
            status: { invalid: false, dirty: true },
          },
          {
            id: 'organizations',
            label: 'Organizations',
            optional: true,
            content: <p>Relationship drafts</p>,
            status: { invalid: true, issueCount: 2, dirty: true },
          },
        ]}
        footer={<button type="button">Create building</button>}
      />,
    )

    const nameInput = screen.getByRole('textbox', { name: 'Building name' })
    await user.clear(nameInput)
    await user.type(nameInput, 'North Gate')
    await user.click(screen.getByRole('tab', { name: /Organizations \(optional\)/ }))

    expect(screen.getByText('Relationship drafts')).toBeVisible()
    expect(nameInput).toBeInTheDocument()
    expect(nameInput).toHaveValue('North Gate')
    expect(screen.getByRole('tab', { name: /2 issues need attention/ })).toBeInTheDocument()
  })

  it('supports controlled navigation and domain-owned setup summary actions', async () => {
    const user = userEvent.setup()
    const onActiveTabChange = vi.fn()
    const onChangeSetup = vi.fn()

    render(
      <CreateModalShell
        open
        onOpenChange={vi.fn()}
        headline="Create building"
        activeTabId="details"
        onActiveTabChange={onActiveTabChange}
        setupSummary={{
          eyebrow: 'Setup',
          summary: 'House · Commercial',
          onChange: onChangeSetup,
        }}
        tabs={[
          {
            id: 'details',
            label: 'Details',
            content: <p>Details panel</p>,
            status: { invalid: false, dirty: false },
          },
          {
            id: 'organizations',
            label: 'Organizations',
            content: <p>Organizations panel</p>,
            status: { invalid: false, dirty: false },
          },
        ]}
        footer={<button type="button">Create building</button>}
      />,
    )

    await user.click(screen.getByRole('tab', { name: 'Organizations' }))
    await user.click(screen.getByRole('button', { name: 'Change' }))

    expect(onActiveTabChange).toHaveBeenCalledWith('organizations')
    expect(onChangeSetup).toHaveBeenCalledOnce()
  })

  it('keeps tab panels mounted while Setup temporarily owns the visible body', () => {
    render(
      <CreateModalShell
        open
        onOpenChange={vi.fn()}
        headline="Create building"
        tabsVisible={false}
        tabs={[
          {
            id: 'details',
            label: 'Details',
            content: <input aria-label="Preserved Building name" defaultValue="Copper Kettle" />,
            status: { invalid: false, dirty: true },
          },
        ]}
        footer={<button type="button">Continue</button>}
      >
        <p>Building Setup choices</p>
      </CreateModalShell>,
    )

    expect(screen.getByText('Building Setup choices')).toBeVisible()
    expect(
      screen.getByRole('textbox', { name: 'Preserved Building name', hidden: true }),
    ).toHaveValue('Copper Kettle')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <CreateModalShell
        open
        onOpenChange={vi.fn()}
        headline="Create place"
        description="Enter the place details."
        footer={<button type="button">Create</button>}
      >
        <label>
          Name
          <input />
        </label>
      </CreateModalShell>,
    )

    await expectNoAxeViolations(container)
  })
})
