/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { z } from 'zod'

import { Form } from '../shells/form.client'
import type { FormItem } from '../field-config'

describe('resolve field issue rendered control', () => {
  it('shows both distinct reasons on one control after submit', async () => {
    const user = userEvent.setup()
    const schema = z
      .object({
        modes: z.string(),
      })
      .superRefine((value, ctx) => {
        if (!value.modes.includes('fly')) {
          ctx.addIssue({
            code: 'custom',
            message: 'Select at least one mode.',
            path: ['modes'],
          })
        }
        if (value.modes.split(',').length < 2) {
          ctx.addIssue({
            code: 'custom',
            message: 'Modes overlap.',
            path: ['modes'],
          })
        }
      })
    const fields: FormItem[] = [
      { type: 'text', name: 'modes', label: 'Available modes', required: true },
    ]

    render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{ modes: 'walk' }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      const message = screen.getByText(/Select at least one mode\./)
      expect(message).toBeInTheDocument()
      expect(screen.getByText(/Modes overlap\./)).toBeInTheDocument()
    })
  })
})
