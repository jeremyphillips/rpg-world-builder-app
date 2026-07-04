import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'

import { Form } from '../shells/form.client'
import type { FormItem } from '../field-config'
import { submitAndExpectPayload } from '../test-utils'

const schema = z.object({
  mode: z.enum(['melee', 'ranged']),
  properties: z.array(z.string()),
})

type Values = z.infer<typeof schema>

const modeField: FormItem = {
  type: 'radio',
  name: 'mode',
  label: 'Mode',
  options: [
    { value: 'melee', label: 'Melee' },
    { value: 'ranged', label: 'Ranged' },
  ],
  defaultValue: 'melee',
}

const propertyField: FormItem = {
  type: 'chips',
  name: 'properties',
  label: 'Properties',
  options: [
    { value: 'reach', label: 'Reach' },
    { value: 'finesse', label: 'Finesse' },
  ],
  optionAvailability: {
    dependsOn: ['mode'],
    enabledWhen: (values, optionValue) => values.mode !== 'ranged' || optionValue !== 'reach',
  },
  dynamicHint: {
    dependsOn: ['mode'],
    hintWhen: (values) =>
      values.mode === 'ranged' ? 'Reach is unavailable for ranged weapons.' : undefined,
  },
}

describe('Form conditional option and hint logic', () => {
  it('disables incompatible chips and shows a dynamic hint', async () => {
    const user = userEvent.setup()
    render(
      <Form<Values>
        schema={schema}
        fields={[modeField, propertyField]}
        defaultValues={{ mode: 'ranged', properties: ['reach'] }}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('Reach is unavailable for ranged weapons.')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Reach' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('checkbox', { name: 'Reach' })).toBeDisabled()
    expect(screen.getByRole('checkbox', { name: 'Finesse' })).toBeEnabled()

    await user.click(screen.getByRole('radio', { name: 'Melee' }))

    expect(screen.queryByText('Reach is unavailable for ranged weapons.')).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Reach' })).toBeEnabled()
  })
})

describe('Form value sync', () => {
  it('patches dependent values when a driver field changes after mount', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const propertiesOnly: FormItem = {
      type: 'chips',
      name: 'properties',
      label: 'Properties',
      options: [
        { value: 'reach', label: 'Reach' },
        { value: 'finesse', label: 'Finesse' },
      ],
    }

    render(
      <Form<Values>
        schema={schema}
        fields={[modeField, propertiesOnly]}
        defaultValues={{ mode: 'melee', properties: ['reach', 'finesse'] }}
        valueSyncs={[
          {
            dependsOn: ['mode'],
            apply: (values) =>
              values.mode === 'ranged'
                ? { properties: ['finesse'] }
                : { properties: values.properties },
          },
        ]}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.getByRole('checkbox', { name: 'Reach' })).toHaveAttribute('aria-checked', 'true')

    await user.click(screen.getByRole('radio', { name: 'Ranged' }))

    await waitFor(() =>
      expect(screen.getByRole('checkbox', { name: 'Reach' })).toHaveAttribute(
        'aria-checked',
        'false',
      ),
    )

    await submitAndExpectPayload(user, onSubmit, { mode: 'ranged', properties: ['finesse'] })
  })

  it('does not sync on initial mount', () => {
    render(
      <Form<Values>
        schema={schema}
        fields={[modeField, propertyField]}
        defaultValues={{ mode: 'ranged', properties: ['reach'] }}
        valueSyncs={[
          {
            dependsOn: ['mode'],
            apply: () => ({ properties: [] }),
          },
        ]}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByRole('checkbox', { name: 'Reach' })).toHaveAttribute('aria-checked', 'true')
  })
})
