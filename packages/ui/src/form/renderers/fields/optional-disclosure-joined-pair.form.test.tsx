import { z } from 'zod'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Form } from '../../shells/form.client'
import type { JoinedPairFieldConfig } from '../../field-config'

const LONG_HINT = 'Disadvantage beyond normal range.'

const longRangeField: JoinedPairFieldConfig = {
  type: 'joinedPair',
  label: 'Long range',
  width: 'auto',
  hint: { text: LONG_HINT, position: 'below-control' },
  start: {
    kind: 'select',
    name: 'range.long',
    options: [
      { value: 80, label: '80' },
      { value: 120, label: '120' },
    ],
    digits: 3,
    ariaLabel: 'Long range value',
  },
  end: {
    kind: 'label',
    text: 'ft.',
    ariaLabel: 'Long range unit',
  },
  optionalDisclosure: {
    addLabel: 'Add long range',
    expandWhenPopulated: true,
  },
}

const schema = z.object({
  range: z.object({
    long: z.number().optional(),
  }),
})

describe('OptionalDisclosureJoinedPairFieldRenderer in anatomy row', () => {
  it('places the long hint in the message region when expanded', async () => {
    const user = userEvent.setup()

    render(
      <Form
        schema={schema}
        defaultValues={{ range: { long: 80 } }}
        onSubmit={vi.fn()}
        fields={[
          {
            kind: 'row',
            fields: [longRangeField],
          },
        ]}
      />,
    )

    const participant = screen
      .getByRole('combobox', { name: 'Long range value' })
      .closest('[data-field-row-participant]')
    if (!participant) throw new Error('expected row participant')

    const hint = within(participant as HTMLElement).getByText(LONG_HINT)
    expect(hint.closest('[data-field-message-region]')).not.toBeNull()
    expect(hint.closest('[data-field-control-region]')).toBeNull()
    expect(screen.getByRole('button', { name: 'Remove Long range' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remove Long range' }))
    expect(within(participant as HTMLElement).queryByText(LONG_HINT)).not.toBeInTheDocument()
  })

  it('renders validation errors in the message region with stable ids', async () => {
    const user = userEvent.setup()
    const longRangeInvalid: JoinedPairFieldConfig = {
      ...longRangeField,
      start: {
        ...longRangeField.start,
        kind: 'select',
        name: 'range.long',
        options: [
          { value: 80, label: '80' },
          { value: 120, label: '120' },
        ],
      },
    }
    const invalidSchema = z.object({
      range: z.object({
        long: z.number().max(100, 'Long must be at most 100'),
      }),
    })

    render(
      <Form
        schema={invalidSchema}
        defaultValues={{ range: { long: 120 } }}
        onSubmit={vi.fn()}
        mode="onChange"
        fields={[
          {
            kind: 'row',
            fields: [longRangeInvalid],
          },
        ]}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))
    const error = await screen.findByText('Long must be at most 100')
    expect(error.closest('[data-field-message-region]')).not.toBeNull()
    expect(error).toHaveAttribute('id', expect.stringContaining('range.long-error'))
  })

  it('does not duplicate hint text in the control region', () => {
    render(
      <Form
        schema={schema}
        defaultValues={{ range: { long: 80 } }}
        onSubmit={vi.fn()}
        fields={[
          {
            kind: 'row',
            fields: [longRangeField],
          },
        ]}
      />,
    )

    expect(screen.getAllByText(LONG_HINT)).toHaveLength(1)
  })
})
