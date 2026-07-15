import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'

import { Form } from '../../shells/form.client'
import type { FormItem } from '../../field-config'

const schema = z.object({
  choose: z.number(),
  poolSource: z.enum(['filtered', 'explicit']),
})

type Values = z.infer<typeof schema>

const fields: FormItem[] = [
  {
    type: 'inlineChooseCount',
    name: 'choose',
    label: 'Choice count',
    hideLabel: true,
    prefix: 'Character chooses',
    suffix: 'item(s) from',
    chooseMin: 1,
    selectName: 'poolSource',
    selectLabel: 'Pool source',
    selectOptions: [
      { value: 'filtered', label: 'A category of equipment' },
      { value: 'explicit', label: 'A list of specific items' },
    ],
    selectDefaultValue: 'filtered',
    selectRequired: true,
  },
]

describe('InlineChooseCountField form integration', () => {
  it('submits count and trailing select values', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <Form<Values>
        schema={schema}
        fields={fields}
        defaultValues={{ choose: 1, poolSource: 'filtered' }}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledWith({ choose: 1, poolSource: 'filtered' }, expect.anything())
  })
})
