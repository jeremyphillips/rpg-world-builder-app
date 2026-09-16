import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { z } from 'zod'

import { Form } from './form.client'
import { FormShellFooterScope, FormShellFooterSlot } from '../chrome/form-shell-footer.context'
import type { FormItem } from '../field-config'
import { submitAndExpectPayload } from '../test-utils'
import { dialogPanelSectionInsetXClasses } from '../../components/ui/dialog-panel.variants'
import { cn } from '../../lib/utils'

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

  it('uses sm control scale when density is compact', () => {
    render(
      <Form<Values>
        schema={schema}
        fields={[{ type: 'text', name: 'name', label: 'Name' }]}
        density="compact"
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveClass('h-8')
  })

  it('keeps md control scale on comfortable density by default', () => {
    render(
      <Form<Values>
        schema={schema}
        fields={[{ type: 'text', name: 'name', label: 'Name' }]}
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveClass('h-9')
  })

  it('uses controlSizeOverride for leaf control scale', () => {
    render(
      <Form<Values>
        schema={schema}
        fields={[
          {
            type: 'text',
            name: 'name',
            label: 'Name',
            controlSizeOverride: 'lg',
          },
        ]}
        density="compact"
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveClass('h-11')
  })

  it('renders inlineSentence fields in schema rows with field anatomy regions', () => {
    const rowSchema = z.object({
      senseType: z.string(),
      senseRange: z.string(),
    })
    const rowFields: FormItem[] = [
      {
        kind: 'row',
        fields: [
          {
            type: 'select',
            name: 'senseType',
            label: 'Sense type',
            options: [{ value: 'darkvision', label: 'Darkvision' }],
            width: '2/3',
          },
          {
            type: 'inlineSentence',
            name: 'senseRange',
            label: 'Range',
            width: '1/3',
            segments: [
              {
                kind: 'select',
                name: 'senseRange',
                options: [{ value: '60', label: '60' }],
                defaultValue: '60',
                ariaLabel: 'Range',
              },
              { kind: 'text', value: 'ft.', tone: 'label' },
            ],
          },
        ],
      },
    ]
    const { container } = render(
      <Form
        schema={rowSchema}
        fields={rowFields}
        defaultValues={{ senseType: 'darkvision', senseRange: '60' }}
        onSubmit={vi.fn()}
      />,
    )

    const row = container.querySelector('[data-field-row]')
    expect(row).toBeTruthy()
    expect(row?.querySelectorAll('[data-field-label-region]')).toHaveLength(2)
    expect(row?.querySelector('fieldset')).toBeNull()
    expect(row?.querySelector('[data-field-label-region]')?.textContent).toContain('Sense type')
    expect(row?.querySelectorAll('[data-field-label-region]')[1]?.textContent).toContain('Range')
    expect(row?.textContent).toContain('ft.')
  })

  it('renders schema rows as anatomy-grid rows', () => {
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
    expect(row).toHaveAttribute('data-field-row-anatomy', '')
    expect(row).toHaveClass('grid')
    expect(row).toHaveClass('field-row-anatomy-grid')
    expect(row).not.toHaveClass('flex')

    const participants = container.querySelectorAll('[data-field-row-participant]')
    expect(participants).toHaveLength(2)
    expect(participants[0]).toHaveAttribute('data-field-anatomy', '')
    expect(participants[0]?.querySelector('[data-field-label-region]')).not.toBeNull()
    expect(participants[0]?.querySelector('[data-field-control-region]')).not.toBeNull()
    expect(participants[0]?.querySelector('[data-field-message-region]')).not.toBeNull()
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

  it('wraps external footers in a scroll region without growing the rhythm stack', () => {
    const { container } = render(
      <FormShellFooterScope>
        <Form<Values>
          schema={schema}
          fields={[{ type: 'text', name: 'name', label: 'Name' }]}
          onSubmit={vi.fn()}
          externalFooter
          contentClassName={cn(dialogPanelSectionInsetXClasses, 'pt-0')}
          footer={<button type="submit">Save</button>}
        />
        <div data-testid="overlay-footer">
          <FormShellFooterSlot />
        </div>
      </FormShellFooterScope>,
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

    expect(screen.getByTestId('overlay-footer')).toBeInTheDocument()
    expect(screen.queryByRole('toolbar', { name: 'Form actions' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('follows content when documentScroll and stickyFooter are both enabled', () => {
    const { container } = render(
      <Form<Values>
        schema={schema}
        fields={[{ type: 'text', name: 'name', label: 'Name' }]}
        onSubmit={vi.fn()}
        stickyFooter
        documentScroll
        footer={<button type="submit">Save</button>}
      />,
    )

    const form = container.querySelector('form')
    expect(form).not.toHaveClass('min-h-full')
    expect(form).not.toHaveClass('flex-1')
    expect(container.querySelector('.form-scroll-body-container')).toBeNull()
    expect(container.querySelector('.overflow-y-auto')).toBeNull()
    expect(screen.getByRole('toolbar', { name: 'Form actions' }).parentElement).not.toHaveClass(
      'mt-auto',
    )
    expect(screen.getByRole('toolbar', { name: 'Form actions' })).toBeInTheDocument()
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
