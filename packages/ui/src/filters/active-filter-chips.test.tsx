/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ActiveFilterChips } from './active-filter-chips.client'

describe('ActiveFilterChips', () => {
  it('renders removable chips and clear-all when two or more are active', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    const onClearAll = vi.fn()

    render(
      <ActiveFilterChips
        chips={[
          { fieldId: 'unread', label: 'Unread only', valueLabel: '' },
          { fieldId: 'category', label: 'Type', valueLabel: 'Message' },
        ]}
        onClear={onClear}
        onClearAll={onClearAll}
      />,
    )

    expect(screen.getByText('Unread only')).toBeInTheDocument()
    expect(screen.getByText('Type: Message')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear unread only filter' }))
    expect(onClear).toHaveBeenCalledWith('unread')

    await user.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(onClearAll).toHaveBeenCalledTimes(1)
  })
})
