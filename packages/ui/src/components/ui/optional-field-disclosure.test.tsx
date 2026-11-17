import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { FieldRowAnatomyProvider } from './field-row-anatomy.context'
import { TextareaField } from './textarea-field'
import { OptionalFieldDisclosure } from './optional-field-disclosure.client'

function renderDisclosure({
  open = false,
  value = '',
  onOpenChange = vi.fn(),
  onRemove = vi.fn(),
  onChange = vi.fn(),
}: {
  open?: boolean
  value?: string
  onOpenChange?: (open: boolean) => void
  onRemove?: () => void
  onChange?: (value: string) => void
} = {}) {
  return render(
    <OptionalFieldDisclosure
      controlId="note-field"
      fieldLabel="Additional behavior"
      addLabel="Add additional behavior"
      removeLabel="Remove"
      open={open}
      onOpenChange={onOpenChange}
      onRemove={onRemove}
      size="sm"
    >
      <TextareaField
        id="note-field"
        label=""
        aria-label="Additional behavior"
        placeholder="Describe behavior not modeled above..."
        rows={3}
        width="full"
        size="sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </OptionalFieldDisclosure>,
  )
}

describe('OptionalFieldDisclosure', () => {
  it('renders the add control when collapsed', () => {
    renderDisclosure()

    const addButton = screen.getByRole('button', { name: 'Add additional behavior' })
    expect(addButton).toBeInTheDocument()
    expect(addButton).toHaveClass(
      'text-foreground',
      'text-action-standalone',
      'ui-button__text--xs',
    )
    expect(addButton).not.toHaveClass('hover:bg-accent')
    expect(screen.queryByRole('textbox', { name: 'Additional behavior' })).not.toBeInTheDocument()
  })

  it('opens on add and shows the field header plus control', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    renderDisclosure({ onOpenChange })

    await user.click(screen.getByRole('button', { name: 'Add additional behavior' }))

    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('renders expanded content with remove action', async () => {
    const onRemove = vi.fn()
    const user = userEvent.setup()
    const { container } = renderDisclosure({ open: true, onRemove })

    expect(screen.getByText('Additional behavior')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Additional behavior' })).toBeInTheDocument()

    const removeButton = screen.getByRole('button', { name: 'Remove Additional behavior' })
    const label = screen.getByText('Additional behavior').closest('label')
    expect(removeButton).toHaveClass(
      'text-foreground',
      'text-action-standalone',
      'ui-button__text--xs',
    )
    expect(label).toHaveClass('self-center')
    expect(label).not.toHaveClass('self-start')
    expect(label?.parentElement?.parentElement).toHaveClass('items-center')
    expect(container.querySelector('.flex.flex-col.gap-1')).toBeNull()

    await user.click(removeButton)
    expect(onRemove).toHaveBeenCalledOnce()
  })

  it('renders hoisted message content in the row message region when open', () => {
    const { container } = render(
      <FieldRowAnatomyProvider>
        <OptionalFieldDisclosure
          controlId="note-field"
          fieldLabel="Long range"
          addLabel="Add long range"
          removeLabel="Remove"
          open
          onOpenChange={vi.fn()}
          onRemove={vi.fn()}
          size="md"
          message={<p id="note-field-hint">Disadvantage beyond normal range.</p>}
        >
          <TextareaField
            id="note-field"
            label=""
            aria-label="Long range"
            rows={1}
            width="full"
            size="md"
            value=""
            onChange={vi.fn()}
          />
        </OptionalFieldDisclosure>
      </FieldRowAnatomyProvider>,
    )

    const participant = container.querySelector('[data-field-row-participant]')
    if (!participant) throw new Error('expected row participant')
    const hint = screen.getByText('Disadvantage beyond normal range.')
    expect(hint.closest('[data-field-message-region]')).not.toBeNull()
    expect(hint.closest('[data-field-control-region]')).toBeNull()
  })

  it('uses xs micro-actions for add and remove with matching emphasis', () => {
    const microActionContract = [
      'ui-button__text--xs',
      'text-action-standalone',
      'text-foreground',
      'font-body-emphasis',
    ] as const

    const { unmount: unmountCollapsed } = render(
      <OptionalFieldDisclosure
        controlId="note-field"
        fieldLabel="Additional behavior"
        addLabel="Add additional behavior"
        removeLabel="Remove"
        open={false}
        labeled
        onOpenChange={vi.fn()}
        onRemove={vi.fn()}
        size="md"
      >
        {null}
      </OptionalFieldDisclosure>,
    )
    const addButton = screen.getByRole('button', { name: 'Add additional behavior' })
    unmountCollapsed()

    const { unmount: unmountOpen } = renderDisclosure({ open: true })
    const removeButton = screen.getByRole('button', { name: 'Remove Additional behavior' })
    unmountOpen()

    for (const className of microActionContract) {
      expect(addButton).toHaveClass(className)
      expect(removeButton).toHaveClass(className)
    }
  })

  it('renders labeled summary at field-value scale instead of caption', () => {
    render(
      <OptionalFieldDisclosure
        controlId="movement"
        fieldLabel="Movement"
        addLabel="Override movement"
        removeLabel="Clear override"
        open={false}
        labeled
        summary="Inherits · Walk 30 ft."
        onOpenChange={vi.fn()}
        onRemove={vi.fn()}
        size="md"
      >
        {null}
      </OptionalFieldDisclosure>,
    )

    const summary = screen.getByText('Inherits · Walk 30 ft.')
    expect(summary).toHaveClass('text-muted-foreground', 'font-normal')
    expect(summary).not.toHaveClass('text-style-caption')
    expect(summary.className).toMatch(/text-\[length:var\(--text-md\)\]/)
    expect(screen.getByRole('button', { name: 'Override movement' })).toHaveClass(
      'ui-button__text--xs',
    )
  })

  it('keeps the header action on the label row when labeled and open', () => {
    render(
      <OptionalFieldDisclosure
        controlId="damage"
        fieldLabel="Damage"
        addLabel="Override damage"
        removeLabel="Clear override"
        open
        labeled
        summary="Inherits · 1d8 slashing"
        onOpenChange={vi.fn()}
        onRemove={vi.fn()}
        size="md"
      >
        <p>Damage controls</p>
      </OptionalFieldDisclosure>,
    )

    const label = screen.getByText('Damage').closest('label')
    const headerRow = label?.parentElement?.parentElement
    expect(headerRow).toHaveClass('items-center', 'justify-between')
    expect(headerRow).toContainElement(
      screen.getByRole('button', { name: 'Clear override Damage' }),
    )
    expect(screen.getByText('Inherits · 1d8 slashing')).not.toHaveClass('text-style-caption')
  })

  it('places the open control on the row control track beside the label and remove action', () => {
    const { container } = render(
      <FieldRowAnatomyProvider>
        <OptionalFieldDisclosure
          controlId="note-field"
          fieldLabel="Cast at level"
          addLabel="Cast at a higher level"
          removeLabel="Remove"
          open
          onOpenChange={vi.fn()}
          onRemove={vi.fn()}
          size="md"
        >
          <TextareaField
            id="note-field"
            label=""
            aria-label="Cast at level"
            rows={1}
            width="full"
            size="md"
            value=""
            onChange={vi.fn()}
          />
        </OptionalFieldDisclosure>
      </FieldRowAnatomyProvider>,
    )

    const participant = container.querySelector('[data-field-row-participant]')
    const labelRegion = container.querySelector('[data-field-label-region]')
    const controlRegion = container.querySelector('[data-field-control-region]')
    expect(participant).toHaveClass('row-span-3', 'grid-rows-subgrid')
    expect(labelRegion).toContainElement(screen.getByText('Cast at level'))
    expect(labelRegion).toContainElement(
      screen.getByRole('button', { name: 'Remove Cast at level' }),
    )
    expect(controlRegion).toContainElement(screen.getByRole('textbox', { name: 'Cast at level' }))
  })

  it('has no accessibility violations when collapsed', async () => {
    const { container } = renderDisclosure()
    await expectNoAxeViolations(container)
  })

  it('has no accessibility violations when expanded', async () => {
    const { container } = renderDisclosure({ open: true })
    await expectNoAxeViolations(container)
  })
})
