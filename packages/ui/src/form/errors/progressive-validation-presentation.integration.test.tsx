import { z } from 'zod'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { FormItem } from '../field-config'
import { defineDependentField } from '../form-authoring'
import { Form } from '../shells/form.client'

const schema = z.object({
  enabled: z.boolean(),
  detail: z.string().min(1, 'Detail is required'),
  name: z.string().min(1, 'Name is required'),
})

describe('progressive validation presentation', () => {
  it('reveals conditional required fields without error text until touch', async () => {
    const user = userEvent.setup()
    const fields: FormItem[] = [
      defineDependentField({
        kind: 'dependent',
        controller: { type: 'switch', name: 'enabled', label: 'Enabled' },
        dependents: {
          fields: [{ type: 'text', name: 'detail', label: 'Detail', required: true }],
        },
      }),
    ]

    render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{ enabled: false, name: 'x' }}
        onSubmit={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('switch', { name: 'Enabled' }))
    await screen.findByRole('textbox', { name: 'Detail' })
    expect(screen.queryByText('Detail is required')).not.toBeInTheDocument()
  })

  it('shows all eligible errors after failed submit', async () => {
    const user = userEvent.setup()
    const fields: FormItem[] = [
      { type: 'text', name: 'name', label: 'Name', required: true },
      defineDependentField({
        kind: 'dependent',
        controller: { type: 'switch', name: 'enabled', label: 'Enabled' },
        dependents: {
          fields: [{ type: 'text', name: 'detail', label: 'Detail', required: true }],
        },
      }),
    ]

    render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{ enabled: true, name: '', detail: '' }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(screen.getByText('Detail is required')).toBeInTheDocument()
  })

  it('suppresses inactive dependent paths after disable', async () => {
    const user = userEvent.setup()
    const fields: FormItem[] = [
      defineDependentField({
        kind: 'dependent',
        controller: { type: 'switch', name: 'enabled', label: 'Enabled' },
        dependents: {
          fields: [{ type: 'text', name: 'detail', label: 'Detail', required: true }],
        },
      }),
    ]

    render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{ enabled: true, detail: '', name: 'ok' }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Detail is required')).toBeInTheDocument()

    await user.click(screen.getByRole('switch', { name: 'Enabled' }))
    await waitFor(() => {
      expect(screen.queryByText('Detail is required')).not.toBeInTheDocument()
    })
  })
})
