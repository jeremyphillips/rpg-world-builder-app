import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { SelectOptionItem } from './select-option-item.client'
import { Select, SelectContent, SelectTrigger, SelectValue } from './select.client'

describe('SelectOptionItem', () => {
  it('renders strong trailing metadata on a list option', () => {
    render(
      <Select defaultOpen>
        <SelectTrigger aria-label="Casting">
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          <SelectOptionItem
            option={{
              label: 'Intelligence',
              value: 'int',
              trailing: { text: 'DC 15', variant: 'strong' },
            }}
          />
        </SelectContent>
      </Select>,
    )
    expect(screen.getByRole('option', { name: 'Intelligence DC 15' })).toBeInTheDocument()
  })

  it('keeps disabled reason styling when disabled', () => {
    render(
      <Select defaultOpen>
        <SelectTrigger aria-label="Movement">
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          <SelectOptionItem
            option={{
              label: 'Fly',
              value: 'fly',
              disabled: true,
              disabledReason: 'Already used',
              trailing: { text: 'DC 15', variant: 'strong' },
            }}
          />
        </SelectContent>
      </Select>,
    )
    expect(screen.getByText('Already used')).toBeInTheDocument()
    expect(screen.queryByText('DC 15')).not.toBeInTheDocument()
  })
})
