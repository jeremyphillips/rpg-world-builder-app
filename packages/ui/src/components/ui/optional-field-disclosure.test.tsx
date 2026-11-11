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
    expect(addButton).toHaveClass('text-foreground', 'text-action-standalone')
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
    expect(removeButton).toHaveClass('text-foreground', 'text-action-standalone')
    expect(label).toHaveClass('self-center')
    expect(label).not.toHaveClass('self-start')
    expect(label?.parentElement).toHaveClass('items-center')
    expect(container.querySelector('.flex.flex-col.gap-1')).toBeNull()

    await user.click(removeButton)
    expect(onRemove).toHaveBeenCalledOnce()
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
