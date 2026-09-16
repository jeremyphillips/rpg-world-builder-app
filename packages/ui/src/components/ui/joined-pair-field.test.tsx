import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import { JoinedPair } from './joined-pair-field.client'

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

    expect(screen.getByRole('group', { name: 'Speed' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Speed value' })).toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'Speed unit' })).not.toBeInTheDocument()
    expect(screen.getByText('ft.')).toBeInTheDocument()
    expect(screen.getByText('ft.')).toHaveClass('bg-surface-faint')
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
    expect(trigger.querySelector('[aria-hidden]')).toHaveClass('self-stretch')
    onValueChange(40)
    expect(onValueChange).toHaveBeenCalledWith(40)
  })
})
