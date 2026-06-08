import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'

import { FormField } from './form-field'

describe('FormField', () => {
  it('links the label to its control via htmlFor/id', () => {
    render(
      <FormField id="name" label="Name">
        <input id="name" />
      </FormField>,
    )
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
  })

  it('shows the hint when there is no error', () => {
    render(
      <FormField id="name" label="Name" hint="Your display name.">
        <input id="name" />
      </FormField>,
    )
    expect(screen.getByText('Your display name.')).toBeInTheDocument()
  })

  it('prefers the error over the hint', () => {
    render(
      <FormField id="name" label="Name" hint="Your display name." error="Name is required.">
        <input id="name" />
      </FormField>,
    )
    expect(screen.getByText('Name is required.')).toBeInTheDocument()
    expect(screen.queryByText('Your display name.')).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <FormField id="name" label="Name">
        <input id="name" />
      </FormField>,
    )
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
