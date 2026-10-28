import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { Form } from '../shells/form.client'
import type { FormItem } from '../field-config'

const schema = z.object({
  count: z.number(),
  level: z.number(),
})

const fields: FormItem[] = [
  {
    type: 'number',
    name: 'count',
    label: 'Count',
    control: 'stepper',
    min: 1,
    max: 5,
    defaultValue: 1,
    digits: 2,
  },
  {
    type: 'number',
    name: 'level',
    label: 'Level',
    min: 1,
    defaultValue: 1,
  },
]

describe('number field stepper control', () => {
  it('renders a stepper only when control is stepper', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <Form
        schema={schema}
        fields={fields}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.getByRole('button', { name: 'Increase Count' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Increase Level' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Increase Count' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ count: 2 }), expect.anything())
  })
})
