import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { z } from 'zod'

import { CardFooter } from './card'
import { FormCard, formCardContentClass } from './form-card'
import { SubmitButton } from './submit-button'
import { Form } from '../../form/shells/form.client'
import type { FormItem } from '../../form/field-config'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

const fields: FormItem[] = [
  { type: 'text', name: 'email', label: 'Email', inputType: 'email', autoComplete: 'email' },
  {
    type: 'text',
    name: 'password',
    label: 'Password',
    inputType: 'password',
    autoComplete: 'current-password',
  },
]

/**
 * `FormCard` is pure chrome: a header above a body slot, with no `<form>` of its
 * own. Render a `<Form>` inside it so there is exactly one form element.
 */
const meta = {
  title: 'Forms/FormCard',
  component: FormCard,
  args: {
    title: 'Sign in',
    description: 'Enter your details to continue.',
    className: 'w-80',
    children: (
      <Form
        schema={schema}
        fields={fields}
        onSubmit={action('submit')}
        contentClassName={formCardContentClass}
        footer={
          <CardFooter className="justify-end">
            <SubmitButton>Continue</SubmitButton>
          </CardFooter>
        }
      />
    ),
  },
} satisfies Meta<typeof FormCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithError: Story = {
  args: {
    children: (
      <Form
        schema={schema}
        fields={fields}
        onSubmit={action('submit')}
        formError="Invalid email or password."
        contentClassName={formCardContentClass}
        footer={
          <CardFooter className="justify-end">
            <SubmitButton>Continue</SubmitButton>
          </CardFooter>
        }
      />
    ),
  },
}
