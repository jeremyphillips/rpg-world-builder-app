import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { Form } from '../shells/form.client'
import type { FormItem } from '../field-config'

const schema = z.object({
  count: z.number(),
  level: z.number(),
  baseAc: z.number().optional(),
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
  {
    type: 'number',
    name: 'baseAc',
    label: 'Base AC',
    control: 'stepper',
    digits: 2,
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
    expect(screen.getByRole('spinbutton', { name: 'Count' })).toHaveValue(2)

    const baseAc = screen.getByRole('spinbutton', { name: 'Base AC' })
    expect(baseAc).toHaveValue(null)
    expect(screen.getByRole('button', { name: 'Decrease Base AC' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Increase Base AC' }))
    expect(baseAc).toHaveValue(1)

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ count: 2, baseAc: 1 }),
      expect.anything(),
    )
  })
})
