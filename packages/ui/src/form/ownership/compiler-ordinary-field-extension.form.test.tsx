/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { z } from 'zod'

import { Form } from '../shells/form.client'
import type { FormItem } from '../field-config'

describe('compiler ordinary field extension', () => {
  it('validates a new text field with schema and field config only', async () => {
    const user = userEvent.setup()
    const schema = z.object({
      label: z.string().min(1, 'Label is required'),
      subtitle: z.string().min(1, 'Subtitle is required'),
    })
    const fields: FormItem[] = [
      { type: 'text', name: 'label', label: 'Label', required: true },
      { type: 'text', name: 'subtitle', label: 'Subtitle', required: true },
    ]

    render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{ label: 'Ok', subtitle: '' }}
        validationPresentation="always"
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Subtitle is required')).toBeInTheDocument()
    expect(await screen.findByRole('textbox', { name: 'Subtitle' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })
})
