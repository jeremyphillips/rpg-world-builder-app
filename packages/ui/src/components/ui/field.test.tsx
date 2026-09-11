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

  it('keeps below-label hint visible with error: aria-invalid, describedby includes both ids', () => {
    renderField({ hint: 'Your display name.', error: 'Name is required.' })
    const input = screen.getByLabelText('Name')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'name-hint name-error')
    expect(screen.getByRole('alert')).toHaveTextContent('Name is required.')
    expect(screen.getByText('Your display name.')).toBeInTheDocument()
  })

  it('hides below-control hint when invalid and points describedby at the error only', () => {
    render(
      <Field.Root
        id="bio"
        error="Bio is required."
        hint="Shown on the profile."
        hintPosition="below-control"
      >
        <Field.Label>Bio</Field.Label>
        <Field.Control>
          <Input />
        </Field.Control>
        <Field.Hint />
        <Field.Error />
      </Field.Root>,
    )
    const input = screen.getByLabelText('Bio')
    expect(input).toHaveAttribute('aria-describedby', 'bio-error')
    expect(screen.queryByText('Shown on the profile.')).not.toBeInTheDocument()
  })

  it('marks invalid without rendering error text when invalid is set alone', () => {
    renderField({ invalid: true, describedBy: 'row-summary' })
    const input = screen.getByLabelText('Name')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'row-summary')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('omits htmlFor when associate is false', () => {
    render(
      <Field.Root id="availability" hint="Helper.">
        <Field.Label associate={false} id="availability-label">
          Campaign availability
        </Field.Label>
        <Field.Control>
          <button type="button" aria-labelledby="availability-label">
            Open
          </button>
        </Field.Control>
        <Field.Hint />
      </Field.Root>,
    )

    const heading = screen.getByText('Campaign availability')
    expect(heading.tagName).toBe('SPAN')
    expect(heading).not.toHaveAttribute('for')
    expect(screen.getByRole('button', { name: 'Campaign availability' })).toHaveAttribute(
      'aria-labelledby',
      'availability-label',
    )
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
