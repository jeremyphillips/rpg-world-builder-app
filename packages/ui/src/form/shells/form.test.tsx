import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { z } from 'zod'

import { Form } from './form.client'
import type { FormItem } from '../field-config'
import { submitAndExpectPayload } from '../test-utils'

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
    await submitAndExpectPayload(user, onSubmit, { name: 'Tasha', hasNickname: false })
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
    await expectNoAxeViolations(container)
  })

  it('uses sm control scale when rhythm is compact', () => {
    render(
      <Form<Values>
        schema={schema}
        fields={[{ type: 'text', name: 'name', label: 'Name' }]}
        rhythm="compact"
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveClass('h-8')
  })

  it('keeps md control scale on comfortable rhythm by default', () => {
    render(
      <Form<Values>
        schema={schema}
        fields={[{ type: 'text', name: 'name', label: 'Name' }]}
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveClass('h-9')
  })

  it('allows per-field size override in compact forms', () => {
    render(
      <Form<Values>
        schema={schema}
        fields={[{ type: 'text', name: 'name', label: 'Name', size: 'md' }]}
        rhythm="compact"
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveClass('h-9')
  })

  it('renders schema rows as flex rows', () => {
    const rowSchema = z.object({
      first: z.string(),
      second: z.string(),
    })
    const rowFields: FormItem[] = [
      {
        kind: 'row',
        fields: [
          { type: 'text', name: 'first', label: 'First name' },
          { type: 'text', name: 'second', label: 'Last name' },
        ],
      },
    ]
    const { container } = render(<Form schema={rowSchema} fields={rowFields} onSubmit={vi.fn()} />)

    const row = container.querySelector('[data-field-row]')
    expect(row).toBeTruthy()
    expect(row).toHaveClass('flex')
    expect(row).toHaveClass('flex-wrap')
    expect(row).not.toHaveClass('grid')
  })

  it('submits when hidden fields use a refined object schema', async () => {
    const refinedSchema = z
      .object({
        name: z.string().min(1, 'Name is required'),
        hasExtra: z.boolean(),
        extra: z.string().min(1, 'Extra is required').optional(),
      })
      .superRefine((values, ctx) => {
        if (values.hasExtra && !values.extra?.trim()) {
          ctx.addIssue({
            code: 'custom',
            message: 'Extra is required when enabled',
            path: ['extra'],
          })
        }
      })

    type RefinedValues = z.infer<typeof refinedSchema>

    const refinedFields: FormItem[] = [
      { type: 'text', name: 'name', label: 'Name' },
      { type: 'switch', name: 'hasExtra', label: 'Has extra' },
      {
        type: 'text',
        name: 'extra',
        label: 'Extra',
        visibility: {
          dependsOn: ['hasExtra'],
          visibleWhen: (values) => values.hasExtra === true,
        },
      },
    ]

    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(
      <Form<RefinedValues>
        schema={refinedSchema}
        fields={refinedFields}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.type(screen.getByLabelText('Name'), 'Tasha')
    await submitAndExpectPayload(user, onSubmit, { name: 'Tasha', hasExtra: false })
  })

  it('wraps sheet docked footers in a scroll region without growing the rhythm stack', () => {
    const { container } = render(
      <Form<Values>
        schema={schema}
        fields={[{ type: 'text', name: 'name', label: 'Name' }]}
        onSubmit={vi.fn()}
        stickyFooter
        footerVariant="sheet"
        contentClassName="px-6 pt-0"
        footer={<button type="submit">Save</button>}
      />,
    )

    const form = container.querySelector('form')
    expect(form).toHaveClass('flex')
    expect(form).toHaveClass('flex-1')

    const scrollRegion = form?.firstElementChild
    expect(scrollRegion).toHaveClass('overflow-y-auto')
    expect(scrollRegion).toHaveClass('flex-1')
    expect(scrollRegion).toHaveClass('px-6')
    expect(scrollRegion).not.toHaveClass('gap-6')

    const rhythmStack = scrollRegion?.firstElementChild
    expect(rhythmStack).toHaveClass('gap-6')
    expect(rhythmStack).not.toHaveClass('flex-1')
    expect(rhythmStack).not.toHaveClass('overflow-y-auto')

    expect(screen.getByRole('toolbar', { name: 'Form actions' })).toHaveClass('shrink-0')
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
