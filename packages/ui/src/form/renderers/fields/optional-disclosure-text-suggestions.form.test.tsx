import { beforeAll, describe, expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Form } from '../../shells/form.client'
import { FormItems } from '../../containers/form-items.client'
import type { FormItem } from '../../field-config'

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

function TextSuggestionsDisclosureHarness({
  items,
  defaultValues = {},
}: {
  items: FormItem[]
  defaultValues?: Record<string, unknown>
}) {
  const form = useForm({ defaultValues })
  return (
    <FormProvider {...form}>
      <FormItems items={items} idPrefix="test" />
    </FormProvider>
  )
}

async function selectFacilityType(user: ReturnType<typeof userEvent.setup>, label: string) {
  await user.click(screen.getByRole('combobox', { name: 'Facility type' }))
  await user.click(screen.getByRole('option', { name: label }))
}

const specializationFields: FormItem[] = [
  {
    type: 'textSuggestions',
    name: 'classification.specialization',
    label: 'Specialization',
    placeholder: 'Enter specialization…',
    suggestions: {
      dependsOn: ['classification.facilityType'],
      suggestionsWhen: (values) => {
        if (values['classification.facilityType'] === 'inn') {
          return ['coaching inn', 'roadside inn']
        }
        if (values['classification.facilityType'] === 'temple') {
          return ['sea temple']
        }
        return []
      },
    },
    optionalDisclosure: {
      addLabel: 'Add specialization',
      removeLabel: 'Remove specialization',
    },
  },
  {
    type: 'select',
    name: 'classification.facilityType',
    label: 'Facility type',
    options: [
      { value: 'inn', label: 'Inn' },
      { value: 'temple', label: 'Temple' },
    ],
  },
]

describe('FormItems textSuggestions optionalDisclosure', () => {
  it('renders an add control when the value is empty', () => {
    render(
      <TextSuggestionsDisclosureHarness
        items={specializationFields}
        defaultValues={{ 'classification.facilityType': 'inn' }}
      />,
    )

    expect(screen.getByRole('button', { name: 'Add specialization' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Specialization' })).not.toBeInTheDocument()
  })

  it('expands populated values and clears them on remove', async () => {
    const user = userEvent.setup()

    render(
      <TextSuggestionsDisclosureHarness
        items={specializationFields}
        defaultValues={{
          'classification.facilityType': 'inn',
          'classification.specialization': 'coaching inn',
        }}
      />,
    )

    expect(screen.getByRole('textbox', { name: 'Specialization' })).toHaveValue('coaching inn')
    await user.click(screen.getByRole('button', { name: 'Remove specialization Specialization' }))
    expect(screen.getByRole('button', { name: 'Add specialization' })).toBeInTheDocument()
  })

  it('collapses manually opened disclosure when suggestion dependsOn values change', async () => {
    const user = userEvent.setup()

    render(
      <TextSuggestionsDisclosureHarness
        items={specializationFields}
        defaultValues={{ 'classification.facilityType': 'inn' }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add specialization' }))
    expect(screen.getByRole('textbox', { name: 'Specialization' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Coaching inn' })).toBeInTheDocument()

    await selectFacilityType(user, 'Temple')

    expect(screen.getByRole('button', { name: 'Add specialization' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Specialization' })).not.toBeInTheDocument()
  })
})

describe('Form specialization disclosure with value sync', () => {
  const schema = z.object({
    'classification.facilityType': z.string().optional(),
    'classification.specialization': z.string().optional(),
  })

  it('collapses disclosure after facility type change clears specialization', async () => {
    const user = userEvent.setup()

    render(
      <Form
        schema={schema}
        fields={specializationFields}
        defaultValues={{
          'classification.facilityType': 'inn',
          'classification.specialization': 'coaching inn',
        }}
        valueSyncs={[
          {
            dependsOn: ['classification.facilityType'],
            apply: (values, changedKeys) => {
              if (!changedKeys.includes('classification.facilityType')) return undefined
              if (!values['classification.specialization']) return undefined
              return { 'classification.specialization': undefined }
            },
          },
        ]}
        onSubmit={() => {}}
      />,
    )

    expect(screen.getByRole('textbox', { name: 'Specialization' })).toHaveValue('coaching inn')

    await selectFacilityType(user, 'Temple')

    expect(screen.getByRole('button', { name: 'Add specialization' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Specialization' })).not.toBeInTheDocument()
  })
})
