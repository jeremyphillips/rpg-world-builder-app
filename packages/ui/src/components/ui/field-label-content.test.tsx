import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { FieldLabelContent, FieldLabelLine } from './field-label-content'
import { FormFieldLabel } from '../../form/presentation/form-field-label.client'
import { Field } from './field.client'
import { Input } from './input.client'

describe('FieldLabelContent', () => {
  it('renders a single visible required marker when showRequiredMarker is true', () => {
    render(<FieldLabelContent label="Name" showRequiredMarker />)
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getAllByText('*')).toHaveLength(1)
  })

  it('omits the visible marker when showRequiredMarker is false', () => {
    render(<FieldLabelContent label="Score 1" showRequiredMarker={false} />)
    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })
})

describe('FieldLabelLine', () => {
  it('keeps the info button outside the naming element', () => {
    render(
      <FieldLabelLine label="Limit" info="Only positive values.">
        <span data-testid="name">Limit</span>
      </FieldLabelLine>,
    )
    const name = screen.getByTestId('name')
    const info = screen.getByRole('button', { name: 'About Limit' })
    const cluster = name.parentElement
    expect(cluster).toHaveClass('inline-flex', 'items-center', 'gap-1.5')
    expect(cluster).toContainElement(info)
    expect(name).not.toContainElement(info)
  })
})

describe('FormFieldLabel', () => {
  it('shows the marker for visible required labels', () => {
    render(
      <Field.Root id="name" required>
        <FormFieldLabel label="Name" required />
        <Field.Control>
          <Input />
        </Field.Control>
      </Field.Root>,
    )
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('hides the marker for sr-only required labels', () => {
    render(
      <Field.Root id="score" required>
        <FormFieldLabel label="Standard array score 1" labelVisibility="srOnly" required />
        <Field.Control>
          <Input />
        </Field.Control>
      </Field.Root>,
    )
    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })

  it('excludes info copy from the native label accessible name', () => {
    render(
      <Field.Root id="limit">
        <FormFieldLabel label="Limit" info="Only positive values." htmlFor="limit" />
        <Field.Control>
          <Input id="limit" />
        </Field.Control>
      </Field.Root>,
    )
    expect(screen.getByRole('textbox', { name: 'Limit' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /About Limit/ })).not.toBeInTheDocument()
  })
})
