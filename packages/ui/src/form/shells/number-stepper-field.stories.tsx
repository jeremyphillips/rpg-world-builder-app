import type { Meta, StoryObj } from '@storybook/react-vite'
import { z } from 'zod'

import { Form } from './form.client'
import type { FormItem } from '../field-config'

const schema = z.object({
  bonus: z.number().int().min(1),
})

const fields: FormItem[] = [
  {
    type: 'number',
    name: 'bonus',
    label: 'Natural armor bonus',
    labelPosition: 'settings',
    control: 'stepper',
    min: 1,
    defaultValue: 1,
    digits: 2,
  },
]

const meta = {
  title: 'Forms/NumberStepperField',
  component: Form,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Form>

export default meta
type Story = StoryObj<typeof meta>

export const Stepper: Story = {
  args: {
    schema,
    fields,
    onSubmit: () => undefined,
    className: 'max-w-lg',
  },
}
