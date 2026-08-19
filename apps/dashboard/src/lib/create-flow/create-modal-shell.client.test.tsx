/**
 * @vitest-environment jsdom
 */
import * as React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { CreateModalShell } from './create-modal-shell.client'

const modalContentSpy = vi.fn()

vi.mock('@rpg/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@rpg/ui')>()
  const ActualModalContent = actual.Modal.Content

  return {
    ...actual,
    Modal: {
      ...actual.Modal,
      Content: (props: React.ComponentProps<typeof ActualModalContent>) => {
        modalContentSpy(props)
        return <ActualModalContent {...props} />
      },
    },
  }
})

describe('CreateModalShell', () => {
  it('selects stable tall Modal layout and owns one body, scroll region, and footer', () => {
    modalContentSpy.mockClear()

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

    expect(modalContentSpy).toHaveBeenCalled()
    const contentProps = modalContentSpy.mock.calls.at(-1)?.[0]
    expect(contentProps).toMatchObject({ layout: 'stable', stableSize: 'tall' })
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
    const issueBadge = screen.getByText('2')
    expect(issueBadge).toHaveClass(
      'min-w-5',
      'justify-center',
      'px-1',
      'tabular-nums',
      'leading-none',
    )
    expect(issueBadge.className).not.toMatch(/createModalShellIssueBadge/)
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
          rows: [
            { label: 'Building form', value: 'House' },
            { label: 'Facility', value: 'Commercial' },
          ],
          changeAriaLabel: 'Change setup',
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
    await user.click(screen.getByRole('button', { name: 'Change setup' }))

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
