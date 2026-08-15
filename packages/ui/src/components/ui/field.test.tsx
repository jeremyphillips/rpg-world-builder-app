import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { Field } from './field.client'
import { Input } from './input.client'

function renderField(
  props: {
    error?: string
    invalid?: boolean
    describedBy?: string
    hint?: string
    required?: boolean
  } = {},
) {
  return render(
    <Field.Root id="name" {...props}>
      <Field.Label>Name</Field.Label>
      <Field.Control>
        <Input />
      </Field.Control>
      <Field.Hint />
      <Field.Error />
    </Field.Root>,
  )
}

describe('Field', () => {
  it('injects the id and links the label', () => {
    renderField()
    expect(screen.getByLabelText('Name')).toHaveAttribute('id', 'name')
  })

  it('describes the control by the hint when there is no error', () => {
    renderField({ hint: 'Your display name.' })
    const input = screen.getByLabelText('Name')
    expect(input).toHaveAttribute('aria-describedby', 'name-hint')
    expect(input).not.toHaveAttribute('aria-invalid')
  })

  it('switches to the error: aria-invalid, describedby points at the alert, hint hidden', () => {
    renderField({ hint: 'Your display name.', error: 'Name is required.' })
    const input = screen.getByLabelText('Name')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'name-error')
    expect(screen.getByRole('alert')).toHaveTextContent('Name is required.')
    expect(screen.queryByText('Your display name.')).not.toBeInTheDocument()
  })

  it('marks invalid without rendering error text when invalid is set alone', () => {
    renderField({ invalid: true, describedBy: 'row-summary' })
    const input = screen.getByLabelText('Name')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'row-summary')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('throws when a part is used outside Field.Root', () => {
    expect(() => render(<Field.Label>Orphan</Field.Label>)).toThrow(/Field\.Label/)
  })

  it('sets native required on native controls', () => {
    renderField({ required: true })
    expect(screen.getByLabelText('Name')).toHaveAttribute('required')
    expect(screen.getByLabelText('Name')).not.toHaveAttribute('aria-required')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderField({ hint: 'Your display name.' })
    await expectNoAxeViolations(container)
  })
})
