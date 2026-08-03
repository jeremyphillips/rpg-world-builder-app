import { beforeAll, describe, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { z } from 'zod'

import { Form } from '../../shells/form.client'
import type { FormItem } from '../../field-config'
import { submitAndExpectPayload } from '../../test-utils'

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => {}
    HTMLElement.prototype.releasePointerCapture = () => {}
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {}
  }
})

const schema = z.object({
  refinement: z.string().optional(),
  driver: z.string().optional(),
})

const fields: FormItem[] = [
  {
    type: 'textSuggestions',
    name: 'refinement',
    label: 'Refinement',
    placeholder: 'Optional',
    suggestions: {
      dependsOn: ['driver'],
      suggestionsWhen: (values) =>
        values.driver === 'inn' ? ['coaching inn', 'roadside inn'] : [],
    },
  },
  {
    type: 'text',
    name: 'driver',
    label: 'Driver',
  },
]

describe('Form textSuggestions field', () => {
  it('submits free-text and suggestion-selected values', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{ driver: 'inn' }}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )

    const refinement = screen.getByRole('combobox', { name: 'Refinement' })
    await user.click(refinement)
    await user.click(screen.getByRole('option', { name: 'Coaching inn' }))

    await submitAndExpectPayload(user, onSubmit, { refinement: 'Coaching inn', driver: 'inn' })
  })
})
