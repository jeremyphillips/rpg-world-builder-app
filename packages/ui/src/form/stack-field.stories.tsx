import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { z } from 'zod'

import { Form } from './form.client'
import type { FormItem } from './field-config'

const stackSchema = z.object({
  advancedEnabled: z.boolean(),
  advancedValue: z.number().optional(),
})

type StackForm = z.infer<typeof stackSchema>

const plainStackFields: FormItem[] = [
  {
    kind: 'stack',
    fields: [
      { type: 'switch', name: 'advancedEnabled', label: 'Advanced options' },
      {
        type: 'number',
        name: 'advancedValue',
        label: 'Threshold',
        defaultValue: 10,
        visibility: {
          dependsOn: ['advancedEnabled'],
          visibleWhen: (values) => values.advancedEnabled === true,
        },
      },
    ],
  },
]

const toggleDependentStackFields: FormItem[] = [
  {
    kind: 'stack',
    layout: 'toggleDependent',
    dependentsChrome: 'subtle',
    fields: [
      {
        type: 'switch',
        name: 'advancedEnabled',
        label: 'Advanced options',
        hint: 'Enable to configure the threshold below.',
      },
      {
        type: 'number',
        name: 'advancedValue',
        label: 'Threshold',
        labelPosition: 'settings',
        defaultValue: 10,
        visibility: {
          dependsOn: ['advancedEnabled'],
          visibleWhen: (values) => values.advancedEnabled === true,
        },
      },
    ],
  },
]

const toggleDependentErrorToneFields: FormItem[] = [
  {
    kind: 'stack',
    layout: 'toggleDependent',
    dependentsChrome: 'error',
    fields: [
      {
        type: 'switch',
        name: 'advancedEnabled',
        label: 'Risky override',
        hint: 'Reserved error tone — for future validation callouts.',
        defaultValue: true,
      },
      {
        type: 'number',
        name: 'advancedValue',
        label: 'Override value',
        labelPosition: 'settings',
        defaultValue: 99,
      },
    ],
  },
]

const meta = {
  title: 'Forms/Form/Stack',
  component: Form<StackForm>,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Form<StackForm>>

export default meta
type Story = StoryObj<typeof meta>

/** Default layout stack — tight inner rhythm, no toggle-dependent split. */
export const PlainStack: Story = {
  args: {
    schema: stackSchema,
    fields: plainStackFields,
    defaultValues: { advancedEnabled: false },
    onSubmit: action('submit'),
    className: 'max-w-lg',
  },
}

/** Toggle-dependent stack with subtle dependents-only chrome (production pattern). */
export const ToggleDependentStack: Story = {
  args: {
    schema: stackSchema,
    fields: toggleDependentStackFields,
    defaultValues: { advancedEnabled: true, advancedValue: 13 },
    onSubmit: action('submit'),
    className: 'max-w-lg',
  },
}

/** Error tone slot — future-facing semantic chrome variant. */
export const ToggleDependentStackErrorTone: Story = {
  args: {
    schema: stackSchema,
    fields: toggleDependentErrorToneFields,
    defaultValues: { advancedEnabled: true, advancedValue: 99 },
    onSubmit: action('submit'),
    className: 'max-w-lg',
  },
}
