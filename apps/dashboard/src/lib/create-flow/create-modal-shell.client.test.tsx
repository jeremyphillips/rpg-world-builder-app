/**
 * @vitest-environment jsdom
 */
import * as React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type * as RpgUi from '@rpg/ui'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { CreateModalShell } from './create-modal-shell.client'

const modalContentSpy = vi.fn()

vi.mock('@rpg/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof RpgUi>()
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

  it('disables tab triggers when requested', () => {
    render(
      <CreateModalShell
        open
        onOpenChange={vi.fn()}
        headline="Create building"
        activeTabId="organizations"
        tabs={[
          {
            id: 'details',
            label: 'Details',
            disabled: true,
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
        footer={<button type="button">Add relationship</button>}
      />,
    )

    expect(screen.getByRole('tab', { name: 'Details' })).toBeDisabled()
    expect(screen.getByRole('tab', { name: 'Organizations' })).toBeEnabled()
  })

  it('supports controlled navigation and row-level setup summary actions', async () => {
    const user = userEvent.setup()
    const onActiveTabChange = vi.fn()
    const onRowEdit = vi.fn()

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
            {
              id: 'buildingForm',
              label: 'Building form',
              value: 'House',
              editTarget: { type: 'set', id: 'buildingForm' },
            },
            {
              id: 'buildingFacilityAuthoringGroup',
              label: 'Facility',
              value: 'Commercial',
              editTarget: { type: 'set', id: 'buildingFacilityAuthoringGroup' },
            },
          ],
          onRowEdit,
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
    await user.click(screen.getByRole('button', { name: 'Change building form' }))

    expect(onActiveTabChange).toHaveBeenCalledWith('organizations')
    expect(onRowEdit).toHaveBeenCalledWith({ type: 'set', id: 'buildingForm' })
  })

  it('renders a single tab directly without tab chrome', () => {
    render(
      <CreateModalShell
        open
        onOpenChange={vi.fn()}
        headline="Create building"
        tabs={[
          {
            id: 'details',
            label: 'Details',
            content: <p>Details only</p>,
            status: { invalid: false, dirty: false },
            contentMode: 'managed',
          },
        ]}
        footer={<button type="button">Create building</button>}
      />,
    )

    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
    expect(screen.getByText('Details only')).toBeVisible()
  })

  it('applies the same managed panel wrapper for single-tab and multi-tab content', () => {
    const { rerender } = render(
      <CreateModalShell
        open
        onOpenChange={vi.fn()}
        headline="Create building"
        tabs={[
          {
            id: 'details',
            label: 'Details',
            content: <p>Single tab panel</p>,
            status: { invalid: false, dirty: false },
            contentMode: 'managed',
          },
        ]}
        footer={<button type="button">Create building</button>}
      />,
    )

    const singleTabPanel = screen.getByText('Single tab panel').parentElement
    expect(singleTabPanel).toHaveAttribute('data-create-tab-panel', 'details')
    expect(singleTabPanel).toHaveClass('mt-4', 'min-h-0', 'flex-1', 'flex', 'flex-col')

    rerender(
      <CreateModalShell
        open
        onOpenChange={vi.fn()}
        headline="Create building"
        activeTabId="details"
        tabs={[
          {
            id: 'details',
            label: 'Details',
            content: <p>Multi tab panel</p>,
            status: { invalid: false, dirty: false },
            contentMode: 'managed',
          },
          {
            id: 'organizations',
            label: 'Organizations',
            content: <p>Organizations panel</p>,
            status: { invalid: false, dirty: false },
            contentMode: 'managed',
          },
        ]}
        footer={<button type="button">Create building</button>}
      />,
    )

    const multiTabPanel = screen
      .getByText('Multi tab panel')
      .closest('[data-create-tab-panel="details"]')
    expect(multiTabPanel).toHaveClass('mt-4', 'min-h-0', 'flex-1', 'flex', 'flex-col')
    expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument()
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
