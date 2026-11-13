import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { Form } from '../../shells/form.client'
import type { FormItem } from '../../field-config'
import { submitAndExpectPayload } from '../../test-utils'

const schema = z.object({
  standardActions: z.array(z.string()),
  combination: z.string().optional(),
})

const fields: FormItem[] = [
  {
    type: 'segmentedControl',
    name: 'combination',
    label: 'Behavior',
    defaultValue: 'one',
    options: [
      { value: 'one', label: 'One' },
      { value: 'each', label: 'Each' },
    ],
    interactivity: {
      dependsOn: ['standardActions'],
      disabledWhen: (values) => {
        const selected = values.standardActions
        return !Array.isArray(selected) || selected.length < 2
      },
    },
  },
  {
    type: 'chips',
    name: 'standardActions',
    label: 'Actions',
    options: [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
    ],
  },
]

describe('segmentedControl interactivity', () => {
  it('keeps combination in submit payload while disabled and preserves each after 2→1→2', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{ standardActions: [] as string[], combination: 'one' }}
        footer={<button type="submit">Save</button>}
        onSubmit={onSubmit}
      />,
    )

    const eachButton = screen.getByRole('button', { name: 'Each' })
    expect(eachButton).toBeDisabled()

    await user.click(screen.getByRole('checkbox', { name: 'A' }))
    await user.click(screen.getByRole('checkbox', { name: 'B' }))
    expect(eachButton).not.toBeDisabled()
    await user.click(eachButton)

    await user.click(screen.getByRole('checkbox', { name: 'A' }))
    expect(eachButton).toBeDisabled()

    await user.click(screen.getByRole('checkbox', { name: 'A' }))
    expect(screen.getByRole('button', { name: 'Each' })).toHaveAttribute('aria-pressed', 'true')

    await submitAndExpectPayload(user, onSubmit, {
      standardActions: ['b', 'a'],
      combination: 'each',
    })
  })
})
