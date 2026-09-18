import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import { JoinedPair } from './joined-pair-field.client'
import {
  SELECT_CARET_SLOT_DATA_ATTR,
  SELECT_SIZING_LABEL_DATA_ATTR,
  SELECT_VALUE_SLOT_DATA_ATTR,
} from './select.client'

describe('JoinedPair', () => {
  it('renders select + label without a chevron on the fixed unit', () => {
    render(
      <JoinedPair.Root aria-label="Speed">
        <JoinedPair.SelectOccupant
          id="speed-value"
          ariaLabel="Speed value"
          value={30}
          options={[
            { value: 30, label: '30' },
            { value: 40, label: '40' },
          ]}
          size="md"
          position="start"
          digits={3}
          onValueChange={vi.fn()}
        />
        <JoinedPair.Divider />
        <JoinedPair.LabelOccupant text="ft." ariaLabel="Speed unit" size="md" />
      </JoinedPair.Root>,
    )

    expect(screen.getByRole('group', { name: 'Speed' })).toHaveClass('min-w-max')
    expect(screen.getByRole('group', { name: 'Speed' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Speed value' })).toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'Speed unit' })).not.toBeInTheDocument()
    expect(screen.getByText('ft.')).toBeInTheDocument()
    expect(screen.getByText('ft.')).toHaveClass('ps-2', 'pe-2.5')
    expect(screen.getByText('ft.').closest('[aria-hidden]')).toHaveClass('bg-surface-faint')
  })

  it('renders select + select with chevrons on both segments', () => {
    render(
      <JoinedPair.Root aria-label="Speed">
        <JoinedPair.SelectOccupant
          id="speed-value"
          ariaLabel="Speed value"
          value={30}
          options={[{ value: 30, label: '30' }]}
          size="md"
          position="start"
          digits={3}
          onValueChange={vi.fn()}
        />
        <JoinedPair.Divider />
        <JoinedPair.SelectOccupant
          id="speed-unit"
          ariaLabel="Speed unit"
          value="ft"
          options={[{ value: 'ft', label: 'ft.' }]}
          size="md"
          position="end"
          onValueChange={vi.fn()}
        />
      </JoinedPair.Root>,
    )

    expect(screen.getByRole('combobox', { name: 'Speed value' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Speed unit' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Speed unit' })).toHaveClass('bg-surface-faint')
  })

  it('applies grouped digit width and visual slot on start segments', () => {
    render(
      <JoinedPair.Root aria-label="Speed">
        <JoinedPair.SelectOccupant
          id="speed-value"
          ariaLabel="Speed value"
          value={30}
          options={[{ value: 30, label: '30' }]}
          size="md"
          position="start"
          digits={2}
          onValueChange={vi.fn()}
        />
        <JoinedPair.Divider />
        <JoinedPair.LabelOccupant text="ft." ariaLabel="Speed unit" size="md" />
      </JoinedPair.Root>,
    )

    const trigger = screen.getByRole('combobox', { name: 'Speed value' })
    expect(trigger).toHaveClass('w-auto', 'p-0')
    expect(trigger.querySelector('[data-select-value-slot]')).toHaveClass('min-w-[calc(2*1ch)]')
    expect(trigger.querySelector('[data-select-caret-slot]')).toHaveClass('w-8', 'pe-1')
  })

  it('applies grouped digit width on end segments without pr-1 inset', () => {
    render(
      <JoinedPair.Root aria-label="Speed">
        <JoinedPair.SelectOccupant
          id="speed-value"
          ariaLabel="Speed value"
          value={30}
          options={[{ value: 30, label: '30' }]}
          size="md"
          position="start"
          digits={2}
          onValueChange={vi.fn()}
        />
        <JoinedPair.Divider />
        <JoinedPair.SelectOccupant
          id="speed-unit"
          ariaLabel="Speed unit"
          value="ft"
          options={[{ value: 'ft', label: 'ft.' }]}
          size="md"
          position="end"
          digits={2}
          onValueChange={vi.fn()}
        />
      </JoinedPair.Root>,
    )

    const trigger = screen.getByRole('combobox', { name: 'Speed unit' })
    expect(trigger).toHaveClass('w-auto', 'p-0')
    const column = trigger.querySelector('[data-select-caret-slot]')
    expect(column).toHaveClass('w-8')
    expect(column).not.toHaveClass('pe-1')
  })

  it('supports sizingLabel on grouped end segments', () => {
    render(
      <JoinedPair.Root aria-label="Wealth">
        <JoinedPair.NumberOccupant
          id="amount"
          ariaLabel="Amount"
          value={10}
          size="md"
          digits={2}
          onValueChange={vi.fn()}
        />
        <JoinedPair.Divider />
        <JoinedPair.SelectOccupant
          id="currency"
          ariaLabel="Currency"
          value="gp"
          options={[
            { value: 'cp', label: 'CP' },
            { value: 'gp', label: 'GP' },
          ]}
          size="md"
          position="end"
          sizingLabel="GP"
          onValueChange={vi.fn()}
        />
      </JoinedPair.Root>,
    )

    const trigger = screen.getByRole('combobox', { name: 'Currency' })
    expect(trigger).toHaveTextContent('GP')
    expect(trigger.querySelector('[data-select-sizing-label]')).toHaveTextContent('GP')
    expect(trigger.querySelector('[data-select-caret-slot]')).toHaveClass('w-8')
  })

  it('renders sizingLabels ghosts on grouped end segments', () => {
    render(
      <JoinedPair.Root aria-label="Wealth">
        <JoinedPair.NumberOccupant
          id="amount"
          ariaLabel="Amount"
          value={10}
          size="md"
          digits={2}
          onValueChange={vi.fn()}
        />
        <JoinedPair.Divider />
        <JoinedPair.SelectOccupant
          id="currency"
          ariaLabel="Currency"
          value="gp"
          options={[
            { value: 'cp', label: 'CP' },
            { value: 'gp', label: 'GP' },
            { value: 'sp', label: 'SP' },
          ]}
          size="md"
          position="end"
          sizingLabels={['CP', 'GP', 'SP']}
          onValueChange={vi.fn()}
        />
      </JoinedPair.Root>,
    )

    const trigger = screen.getByRole('combobox', { name: 'Currency' })
    expect(trigger.querySelectorAll(`[${SELECT_SIZING_LABEL_DATA_ATTR}]`)).toHaveLength(3)
    expect(trigger).toHaveTextContent('GP')
  })

  it('aligns label and end select value slot leading padding', () => {
    const { unmount: unmountLabelPair } = render(
      <JoinedPair.Root aria-label="Speed">
        <JoinedPair.SelectOccupant
          id="speed-value"
          ariaLabel="Speed value"
          value={30}
          options={[{ value: 30, label: '30' }]}
          size="md"
          position="start"
          digits={2}
          onValueChange={vi.fn()}
        />
        <JoinedPair.Divider />
        <JoinedPair.LabelOccupant text="ft." ariaLabel="Speed unit" size="md" />
      </JoinedPair.Root>,
    )

    const labelValueSlot = screen.getByText('ft.').closest(`[${SELECT_VALUE_SLOT_DATA_ATTR}]`)
    expect(labelValueSlot).toHaveClass('ps-2')
    expect(screen.queryByRole('combobox', { name: 'Speed unit' })).not.toBeInTheDocument()
    unmountLabelPair()

    render(
      <JoinedPair.Root aria-label="Wealth">
        <JoinedPair.NumberOccupant
          id="amount"
          ariaLabel="Amount"
          value={10}
          size="md"
          digits={2}
          onValueChange={vi.fn()}
        />
        <JoinedPair.Divider />
        <JoinedPair.SelectOccupant
          id="currency"
          ariaLabel="Currency"
          value="gp"
          options={[
            { value: 'cp', label: 'CP' },
            { value: 'gp', label: 'GP' },
          ]}
          size="md"
          position="end"
          sizingLabel="GP"
          onValueChange={vi.fn()}
        />
      </JoinedPair.Root>,
    )

    const trigger = screen.getByRole('combobox', { name: 'Currency' })
    expect(trigger.querySelector(`[${SELECT_VALUE_SLOT_DATA_ATTR}]`)).toHaveClass('ps-2')
    expect(trigger.querySelector(`[${SELECT_CARET_SLOT_DATA_ATTR}]`)).toHaveClass('w-8')
  })

  it('invokes change handlers with numeric option values', () => {
    const onValueChange = vi.fn()

    render(
      <JoinedPair.Root aria-label="Speed">
        <JoinedPair.SelectOccupant
          id="speed-value"
          ariaLabel="Speed value"
          value={30}
          options={[
            { value: 30, label: '30' },
            { value: 40, label: '40' },
          ]}
          size="md"
          position="start"
          digits={3}
          onValueChange={onValueChange}
        />
        <JoinedPair.Divider />
        <JoinedPair.LabelOccupant text="ft." ariaLabel="Speed unit" size="md" />
      </JoinedPair.Root>,
    )

    const trigger = screen.getByRole('combobox', { name: 'Speed value' })
    expect(trigger).toHaveTextContent('30')
    expect(trigger).not.toHaveClass('pr-3.5')
    expect(trigger.querySelector('[data-select-caret-slot]')).toHaveClass('self-stretch', 'pe-1')
    onValueChange(40)
    expect(onValueChange).toHaveBeenCalledWith(40)
  })
})
