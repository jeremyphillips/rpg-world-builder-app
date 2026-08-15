import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

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

  it('renders label and hint in the left column when labelPosition is settings', () => {
    render(
      <FormField
        id="score"
        label="Minimum ability score"
        hint="Applied to every primary ability."
        labelPosition="settings"
        required
      >
        <input id="score" data-testid="control" />
      </FormField>,
    )
    const row = screen.getByTestId('control').closest('.grid')
    expect(row).toHaveClass('sm:grid-cols-[minmax(0,1fr)_auto]')
    const label = screen.getByText('Minimum ability score')
    const hint = screen.getByText('Applied to every primary ability.')
    expect(label.compareDocumentPosition(hint) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(
      hint.compareDocumentPosition(screen.getByTestId('control')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  itAxe('has no axe accessibility violations with settings layout', async () => {
    const { container } = render(
      <FormField
        id="score"
        label="Minimum ability score"
        hint="Applied to every primary ability."
        labelPosition="settings"
      >
        <input id="score" />
      </FormField>,
    )
    await expectNoAxeViolations(container)
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

  it('wraps label, hint, and control in panel chrome when configured', () => {
    render(
      <FormField id="name" label="Name" hint="Your display name." chrome={{ variant: 'panel' }}>
        <input id="name" data-testid="control" />
      </FormField>,
    )
    const control = screen.getByTestId('control')
    const chromeShell = control.closest('.rounded-md.border.bg-surface-subtle')
    expect(chromeShell).toBeTruthy()
    expect(chromeShell?.contains(screen.getByText('Name'))).toBe(true)
    expect(chromeShell?.contains(screen.getByText('Your display name.'))).toBe(true)
  })

  it('wraps the settings row in panel chrome when configured', () => {
    render(
      <FormField
        id="score"
        label="Minimum ability score"
        hint="Applied to every primary ability."
        labelPosition="settings"
        chrome={{ variant: 'panel' }}
      >
        <input id="score" data-testid="control" />
      </FormField>,
    )
    const chromeShell = screen
      .getByTestId('control')
      .closest('.rounded-md.border.bg-surface-subtle')
    expect(chromeShell).toBeTruthy()
    expect(chromeShell?.contains(screen.getByText('Minimum ability score'))).toBe(true)
    expect(chromeShell?.contains(screen.getByText('Applied to every primary ability.'))).toBe(true)
  })

  it('renders exactly one required marker when required', () => {
    render(
      <FormField id="name" label="Name" required>
        <input id="name" data-testid="control" />
      </FormField>,
    )
    expect(screen.getAllByText('*')).toHaveLength(1)
    expect(screen.getByTestId('control')).toHaveAttribute('required')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <FormField id="name" label="Name">
        <input id="name" />
      </FormField>,
    )
    await expectNoAxeViolations(container)
  })
})
