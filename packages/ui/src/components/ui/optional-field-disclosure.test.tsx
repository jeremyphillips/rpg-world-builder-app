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
      addAccessibleName="Add additional behavior"
      removeLabel="Remove"
      removeAccessibleName="Remove Additional behavior"
      open={open}
      onOpenChange={onOpenChange}
      onRemove={onRemove}
      size="sm"
    >
      <TextareaField
        id="note-field"
        label="Additional behavior"
        labelVisibility="srOnly"
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
      'ui-button__text--sm',
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

    expect(screen.getByRole('textbox', { name: 'Additional behavior' })).toBeInTheDocument()

    const removeButton = screen.getByRole('button', { name: 'Remove Additional behavior' })
    const headerSubject = container.querySelector('[aria-hidden]')
    expect(headerSubject).toHaveTextContent('Additional behavior')
    expect(removeButton).toHaveClass(
      'text-foreground',
      'text-action-standalone',
      'ui-button__text--xs',
    )
    expect(headerSubject?.closest('label')).toBeNull()
    expect(headerSubject?.parentElement?.parentElement).toHaveClass('items-center')
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
          addAccessibleName="Add long range"
          removeLabel="Remove"
          removeAccessibleName="Remove"
          open
          onOpenChange={vi.fn()}
          onRemove={vi.fn()}
          size="md"
          message={<p id="note-field-hint">Disadvantage beyond normal range.</p>}
        >
          <TextareaField
            id="note-field"
            label="Long range"
            labelVisibility="srOnly"
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

  it('uses comfortable default geometry for standalone collapsed add actions', () => {
    render(
      <OptionalFieldDisclosure
        controlId="note-field"
        fieldLabel="Additional behavior"
        addLabel="Add additional behavior"
        addAccessibleName="Add additional behavior"
        removeLabel="Remove"
        removeAccessibleName="Remove"
        open={false}
        onOpenChange={vi.fn()}
        onRemove={vi.fn()}
        size="md"
      >
        {null}
      </OptionalFieldDisclosure>,
    )

    expect(screen.getByRole('button', { name: 'Add additional behavior' })).toHaveClass(
      'ui-button__text--default',
    )
  })

  it('uses xs text geometry for standalone collapsed add actions at xs control scale', () => {
    render(
      <OptionalFieldDisclosure
        controlId="spell-field"
        fieldLabel="Spell"
        addLabel="Pin specific spell"
        addAccessibleName="Pin specific spell"
        removeLabel="Clear"
        removeAccessibleName="Clear"
        open={false}
        onOpenChange={vi.fn()}
        onRemove={vi.fn()}
        size="xs"
      >
        {null}
      </OptionalFieldDisclosure>,
    )

    expect(screen.getByRole('button', { name: 'Pin specific spell' })).toHaveClass(
      'ui-button__text--xs',
    )
  })

  it('uses inline xs disclosure actions with matching emphasis', () => {
    const disclosureActionEmphasisClasses = [
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
        addAccessibleName="Add additional behavior"
        removeLabel="Remove"
        removeAccessibleName="Remove"
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

    for (const className of disclosureActionEmphasisClasses) {
      expect(addButton).toHaveClass(className)
      expect(removeButton).toHaveClass(className)
    }
  })

  it('renders labeled summary segments at md scale instead of caption', () => {
    render(
      <OptionalFieldDisclosure
        controlId="movement"
        fieldLabel="Movement"
        addLabel="Override movement"
        addAccessibleName="Override movement"
        removeLabel="Clear override"
        removeAccessibleName="Clear override"
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

    const leading = screen.getByText('Inherits ·', { exact: false })
    expect(leading).toHaveClass('text-muted-foreground', 'font-normal')
    expect(leading.className).toMatch(/text-\[length:var\(--text-md\)\]/)

    const value = screen.getByText('Walk 30 ft.')
    expect(value).toHaveClass('text-foreground', 'font-normal')
    expect(value.className).toMatch(/text-\[length:var\(--text-md\)\]/)
    expect(value).not.toHaveClass('text-style-caption')

    expect(screen.getByRole('button', { name: 'Override movement' })).toHaveClass(
      'ui-button__text--xs',
    )
  })

  it('keeps the header action on the label row when labeled and open', () => {
    const { container } = render(
      <OptionalFieldDisclosure
        controlId="damage"
        fieldLabel="Damage"
        addLabel="Override"
        addAccessibleName="Override Damage"
        addAction="edit"
        removeLabel="Clear override"
        removeAccessibleName="Clear Damage override"
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

    const headerRow = container.querySelector('[aria-hidden]')?.parentElement?.parentElement
    expect(headerRow).toHaveClass('items-center', 'justify-between')
    expect(headerRow).toContainElement(
      screen.getByRole('button', { name: 'Clear Damage override' }),
    )
    expect(screen.getByText('1d8 slashing')).toHaveClass('font-normal')
    expect(screen.getByText('Inherits ·', { exact: false })).toHaveClass('text-muted-foreground')
  })

  it('uses the edit glyph and a full accessible name for a compact override action', () => {
    const { container } = render(
      <OptionalFieldDisclosure
        controlId="damage"
        fieldLabel="Damage"
        addLabel="Override"
        addAccessibleName="Override Damage"
        addAction="edit"
        removeLabel="Clear override"
        removeAccessibleName="Clear Damage override"
        open={false}
        labeled
        onOpenChange={vi.fn()}
        onRemove={vi.fn()}
        size="md"
      >
        {null}
      </OptionalFieldDisclosure>,
    )

    const button = screen.getByRole('button', { name: 'Override Damage' })
    expect(button).toHaveTextContent('Override')
    expect(container.querySelector('[data-icon="pencil"]')).not.toBeNull()
  })

  it('places the open control on the row control track beside the label and remove action', () => {
    const { container } = render(
      <FieldRowAnatomyProvider>
        <OptionalFieldDisclosure
          controlId="note-field"
          fieldLabel="Cast at level"
          addLabel="Cast at a higher level"
          addAccessibleName="Cast at a higher level"
          removeLabel="Remove"
          removeAccessibleName="Remove"
          open
          onOpenChange={vi.fn()}
          onRemove={vi.fn()}
          size="md"
        >
          <TextareaField
            id="note-field"
            label="Cast at level"
            labelVisibility="srOnly"
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
    expect(labelRegion?.querySelector('[aria-hidden]')).toHaveTextContent('Cast at level')
    expect(labelRegion).toContainElement(screen.getByRole('button', { name: 'Remove' }))
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

  it('renders source preview above the open control and omits it when collapsed', () => {
    const { rerender } = render(
      <OptionalFieldDisclosure
        controlId="damage"
        fieldLabel="Damage"
        addLabel="Override"
        addAccessibleName="Override Damage"
        addAction="edit"
        removeLabel="Clear override"
        removeAccessibleName="Clear Damage override"
        open
        labeled
        sourcePreview={{ label: 'Weapon base damage', text: '1d8 slashing' }}
        onOpenChange={vi.fn()}
        onRemove={vi.fn()}
        size="md"
      >
        <p>Damage controls</p>
      </OptionalFieldDisclosure>,
    )

    const sourceLabel = screen.getByText('Weapon base damage:')
    expect(sourceLabel).toHaveClass('text-muted-foreground')
    expect(sourceLabel.className).toMatch(/text-\[length:var\(--text-md\)\]/)

    const sourceValue = screen.getByText('1d8 slashing')
    expect(sourceValue).toHaveClass('text-foreground', 'font-normal')
    expect(sourceValue.className).toMatch(/text-\[length:var\(--text-md\)\]/)
    expect(screen.getByText('Damage controls')).toBeInTheDocument()

    rerender(
      <OptionalFieldDisclosure
        controlId="damage"
        fieldLabel="Damage"
        addLabel="Override"
        addAccessibleName="Override Damage"
        addAction="edit"
        removeLabel="Clear override"
        removeAccessibleName="Clear Damage override"
        open={false}
        labeled
        sourcePreview={{ label: 'Weapon base damage', text: '1d8 slashing' }}
        onOpenChange={vi.fn()}
        onRemove={vi.fn()}
        size="md"
      >
        {null}
      </OptionalFieldDisclosure>,
    )

    expect(screen.queryByText('Weapon base damage')).not.toBeInTheDocument()
    expect(screen.queryByText('1d8 slashing')).not.toBeInTheDocument()
  })
})
