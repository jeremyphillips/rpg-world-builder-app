import type { Meta, StoryObj } from '@storybook/react-vite'

import { CardFooter } from './card'
import { FormCard } from './form-card'
import { SubmitButton } from './submit-button'
import { TextField } from './text-field'

const meta = {
  title: 'Forms/FormCard',
  component: FormCard,
  args: {
    title: 'Sign in',
    description: 'Enter your details to continue.',
    className: 'w-80',
    onSubmit: (event) => event.preventDefault(),
    children: (
      <>
        <TextField id="email" label="Email" type="email" autoComplete="email" />
        <TextField id="password" label="Password" type="password" autoComplete="current-password" />
      </>
    ),
    footer: (
      <CardFooter className="justify-end">
        <SubmitButton>Continue</SubmitButton>
      </CardFooter>
    ),
  },
} satisfies Meta<typeof FormCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithError: Story = {
  args: { formError: 'Invalid email or password.' },
}
