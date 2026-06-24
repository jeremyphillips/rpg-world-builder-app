import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { z } from 'zod'

import { Form } from './form.client'
import type { FormItem } from './field-config'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  hasNickname: z.boolean(),
  nickname: z.string().min(1, 'Nickname is required'),
})

type Values = z.infer<typeof schema>

const fields: FormItem[] = [
  { type: 'text', name: 'name', label: 'Name' },
  { type: 'switch', name: 'hasNickname', label: 'Has a nickname' },
  {
    type: 'text',
    name: 'nickname',
    label: 'Nickname',
    visibility: {
      dependsOn: ['hasNickname'],
      visibleWhen: (values) => values.hasNickname === true,
    },
  },
]

function renderForm(onSubmit: (values: Values) => void) {
  return render(
    <Form<Values>
      schema={schema}
      fields={fields}
      onSubmit={onSubmit}
      footer={<button type="submit">Save</button>}
    />,
  )
}

describe('Form', () => {
  it('hides a conditional field until its dependency is met', async () => {
    const user = userEvent.setup()
    renderForm(vi.fn())
    expect(screen.queryByLabelText('Nickname')).not.toBeInTheDocument()
    await user.click(screen.getByLabelText('Has a nickname'))
    expect(screen.getByLabelText('Nickname')).toBeInTheDocument()
  })

  it('does not require hidden fields and strips them from the payload', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderForm(onSubmit)
    await user.type(screen.getByLabelText('Name'), 'Tasha')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.lastCall?.[0]).toEqual({ name: 'Tasha', hasNickname: false })
  })

  it('blocks submit and shows the message when a visible field is invalid', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderForm(onSubmit)
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('requires a conditional field once it becomes visible', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderForm(onSubmit)
    await user.type(screen.getByLabelText('Name'), 'Tasha')
    await user.click(screen.getByLabelText('Has a nickname'))
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Nickname is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('renders a form-level error and has no axe violations', async () => {
    const { container } = render(
      <Form<Values>
        schema={schema}
        fields={fields}
        onSubmit={vi.fn()}
        formError="Something went wrong."
        footer={<button type="submit">Save</button>}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.')
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })

  it('omits HTML min/max on number fields so values like 20 can be edited to 15', async () => {
    const levelSchema = z.object({
      level: z.number().int().min(1).max(30),
    })
    type LevelValues = z.infer<typeof levelSchema>
    const levelFields: FormItem[] = [
      {
        type: 'number',
        name: 'level',
        label: 'Max level',
        min: 1,
        max: 30,
        defaultValue: 20,
      },
    ]
    const onSubmit = vi.fn()
    render(
      <Form<LevelValues>
        schema={levelSchema}
        fields={levelFields}
        defaultValues={{ level: 20 }}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )

    const input = screen.getByLabelText('Max level')
    expect(input).not.toHaveAttribute('min')
    expect(input).not.toHaveAttribute('max')

    const user = userEvent.setup()
    fireEvent.change(input, { target: { value: '15' } })
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit.mock.lastCall?.[0]).toEqual({ level: 15 }))
  })
})
