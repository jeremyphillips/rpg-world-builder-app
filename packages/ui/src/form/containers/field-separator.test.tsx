import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { z } from 'zod'

import { Form } from '../shells/form.client'
import type { FormItem } from '../field-config'

const schema = z.object({
  featureEnabled: z.boolean(),
  featureLevel: z.string().optional(),
  featureNote: z.string().optional(),
})

type Values = z.infer<typeof schema>

const fields: FormItem[] = [
  {
    kind: 'stack',
    layout: 'dependent',
    dependentsChrome: 'subtle',
    fields: [
      {
        type: 'switch',
        name: 'featureEnabled',
        label: 'Enable feature',
        defaultValue: false,
      },
      {
        type: 'select',
        name: 'featureLevel',
        label: 'Feature level',
        labelPosition: 'settings',
        separator: 'subtle',
        options: [
          { label: '1', value: '1' },
          { label: '2', value: '2' },
        ],
        visibility: {
          dependsOn: ['featureEnabled'],
          visibleWhen: (values) => values.featureEnabled === true,
        },
      },
      {
        type: 'text',
        name: 'featureNote',
        label: 'Feature note',
        visibility: {
          dependsOn: ['featureEnabled'],
          visibleWhen: (values) => values.featureEnabled === true,
        },
      },
    ],
  },
]

function renderForm(defaultValues: Partial<Values> = { featureEnabled: true, featureLevel: '1' }) {
  return render(
    <Form<Values>
      schema={schema}
      fields={fields}
      defaultValues={defaultValues}
      onSubmit={vi.fn()}
    />,
  )
}

describe('field separator', () => {
  it('wraps a leaf field with trailing separator classes', async () => {
    const user = userEvent.setup()
    const { container } = renderForm({ featureEnabled: false })

    await user.click(screen.getByRole('switch', { name: 'Enable feature' }))

    await waitFor(() => {
      const separator = container.querySelector('[data-field-separator]')
      expect(separator).toBeInTheDocument()
      expect(separator).toHaveClass('border-b', 'border-border', 'pb-7')
      expect(separator).toContainElement(screen.getByLabelText('Feature level'))
      expect(separator).not.toContainElement(screen.getByLabelText('Feature note'))
      expect(screen.getByLabelText('Feature note')).toBeInTheDocument()
    })
  })

  it('omits the separator wrapper while a conditional field is hidden', () => {
    const { container } = renderForm({ featureEnabled: false })

    expect(container.querySelector('[data-field-separator]')).toBeNull()
  })

  it('has no axe violations when the separated field is visible', async () => {
    const { container } = renderForm()

    await waitFor(() => expect(screen.getByLabelText('Feature level')).toBeInTheDocument())

    await expectNoAxeViolations(container)
  })
})
