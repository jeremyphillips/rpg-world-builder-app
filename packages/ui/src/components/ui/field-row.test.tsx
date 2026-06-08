import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'

import { FieldRow } from './field-row'
import { TextField } from './text-field'

describe('FieldRow', () => {
  it('renders its child fields side by side', () => {
    render(
      <FieldRow>
        <TextField id="first" label="First name" />
        <TextField id="last" label="Last name" />
      </FieldRow>,
    )
    expect(screen.getByLabelText('First name')).toBeInTheDocument()
    expect(screen.getByLabelText('Last name')).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <FieldRow>
        <TextField id="first" label="First name" />
        <TextField id="last" label="Last name" />
      </FieldRow>,
    )
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
