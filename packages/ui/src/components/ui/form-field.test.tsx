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

  it('renders the hint below the label by default', () => {
    render(
      <FormField id="name" label="Name" hint="Your display name.">
        <input id="name" data-testid="control" />
      </FormField>,
    )
    const label = screen.getByText('Name')
    const hint = screen.getByText('Your display name.')
    const control = screen.getByTestId('control')
    expect(label.compareDocumentPosition(hint) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(hint.compareDocumentPosition(control) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('renders the hint below the control when hintPosition is below-control', () => {
    render(
      <FormField id="name" label="Name" hint="Your display name." hintPosition="below-control">
        <input id="name" data-testid="control" />
      </FormField>,
    )
    const hint = screen.getByText('Your display name.')
    const control = screen.getByTestId('control')
    expect(control.compareDocumentPosition(hint) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
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
