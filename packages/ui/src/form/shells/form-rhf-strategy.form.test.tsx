import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'

import { Form } from './form.client'
import { FORM_RHF_INTEGRATION_STRATEGY } from '../lifecycle/form-evaluation.types'
import type { FormItem } from '../field-config'

/**
 * Mounted proof for the single RHF strategy (`passive-projection`): the resolver only projects
 * the pure evaluator; handleSubmit receives the evaluator's parsed output.
 */
const fields: FormItem[] = [
  { type: 'text', name: 'name', label: 'Name' },
  { type: 'text', name: 'count', label: 'Count' },
]

function makeSchema(onParse?: () => void) {
  const base = z.object({
    name: z.string().min(1, 'Name is required'),
    count: z.coerce.number().int('Count must be a whole number'),
  })
  return onParse
    ? base.transform((value) => {
        onParse()
        return value
      })
    : base
}

function renderForm(props: {
  schema: z.ZodType<{ name: string; count: number }, unknown>
  onSubmit: (values: { name: string; count: number }) => void | Promise<void>
  mode?: 'onSubmit' | 'onBlur' | 'onChange'
}) {
  return render(
    <Form<{ name: string; count: number }>
      schema={props.schema as never}
      fields={fields}
      onSubmit={props.onSubmit}
      mode={props.mode}
      validationPresentation="always"
      footer={(form: { formState: { errors: unknown } }) => (
        <>
          <output data-testid="rhf-errors">
            {JSON.stringify(Object.keys(form.formState.errors as object))}
          </output>
          <button type="submit">Save</button>
        </>
      )}
    />,
  )
}

describe('RHF integration strategy', () => {
  it('names the surviving strategy', () => {
    expect(FORM_RHF_INTEGRATION_STRATEGY).toBe('passive-projection')
  })

  it('delivers parsed output (coerced types) to onSubmit, not the raw input', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderForm({ schema: makeSchema() as never, onSubmit })
    await user.type(screen.getByLabelText('Name'), 'Tasha')
    await user.type(screen.getByLabelText('Count'), '7')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0]![0]).toEqual({ name: 'Tasha', count: 7 })
  })

  it('evaluates once per submit', async () => {
    const user = userEvent.setup()
    const parse = vi.fn()
    const onSubmit = vi.fn()
    renderForm({ schema: makeSchema(parse) as never, onSubmit })
    await user.type(screen.getByLabelText('Name'), 'Tasha')
    await user.type(screen.getByLabelText('Count'), '7')
    parse.mockClear()
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(parse).toHaveBeenCalledTimes(1)
  })

  it('blocks submit and shows an accessible invalid control', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderForm({ schema: makeSchema() as never, onSubmit })
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('keeps progressive blur validation as a passive RHF projection', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderForm({ schema: makeSchema() as never, onSubmit })
    expect(screen.getByTestId('rhf-errors')).toHaveTextContent('[]')
    await user.click(screen.getByLabelText('Name'))
    await user.tab()
    await waitFor(() => expect(screen.getByTestId('rhf-errors')).toHaveTextContent('name'))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('recovers after a rejected submit and submits again', async () => {
    const user = userEvent.setup()
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(undefined)
    renderForm({ schema: makeSchema() as never, onSubmit })
    await user.type(screen.getByLabelText('Name'), 'Tasha')
    await user.type(screen.getByLabelText('Count'), '1')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2))
  })
})
