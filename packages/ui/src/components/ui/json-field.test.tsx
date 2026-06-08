import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'

import { JsonField } from './json-field.client'

describe('JsonField', () => {
  it('flags invalid JSON on blur via the standard error path', async () => {
    const user = userEvent.setup()
    render(<JsonField id="data" label="Data" />)
    const textarea = screen.getByLabelText('Data')
    await user.type(textarea, '{{ not json }')
    await user.tab()
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid JSON')
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
  })

  it('accepts valid JSON without error', async () => {
    const user = userEvent.setup()
    render(<JsonField id="data" label="Data" />)
    const textarea = screen.getByLabelText('Data')
    await user.type(textarea, '{{"hp":7}')
    await user.tab()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('inserts a pretty-printed example via onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<JsonField id="data" label="Data" example={{ hp: 7 }} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Insert example' }))
    expect(onChange).toHaveBeenCalledWith('{\n  "hp": 7\n}')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<JsonField id="data" label="Data" />)
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
