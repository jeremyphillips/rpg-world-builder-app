import type { Meta, StoryObj } from '@storybook/react-vite'
import { Search } from 'lucide-react'
import { expect, within } from 'storybook/test'

import { Input, type InputProps } from './input.client'
import { catalogToolbarSearchIconVariants } from './catalog-toolbar.variants'

function SearchInputField({ disabled, ...props }: InputProps) {
  return (
    <div className="relative max-w-md">
      <Search
        className={catalogToolbarSearchIconVariants({ disabled: Boolean(disabled) })}
        aria-hidden
      />
      <Input className="pl-9" disabled={disabled} {...props} />
    </div>
  )
}

const meta = {
  title: 'Primitives/Input',
  component: Input,
  args: {
    placeholder: 'you@example.com',
    'aria-label': 'Email',
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Email: Story = {
  args: { type: 'email', placeholder: 'you@example.com', 'aria-label': 'Email' },
}

export const Password: Story = {
  args: { type: 'password', placeholder: '••••••••', 'aria-label': 'Password' },
}

export const Disabled: Story = {
  args: { disabled: true, value: 'Disabled', 'aria-label': 'Disabled field' },
}

export const DisabledPlaceholder: Story = {
  args: {
    disabled: true,
    value: '',
    placeholder: 'Choose a relationship first',
    'aria-label': 'Search people and organizations',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox', { name: 'Search people and organizations' })

    expect(input).toBeDisabled()
    expect(input.className).toContain('placeholder:text-input-placeholder')
    expect(input.className).toContain('disabled:placeholder:text-input-disabled')
    expect(input.className).toContain('disabled:text-input-disabled')
  },
}

export const DisabledWithSearchIcon: StoryObj<typeof SearchInputField> = {
  render: (args) => <SearchInputField {...args} />,
  args: {
    disabled: true,
    value: '',
    placeholder: 'Choose a relationship first',
    'aria-label': 'Search people and organizations',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox', { name: 'Search people and organizations' })
    const icon = canvasElement.querySelector('svg')

    expect(input).toBeDisabled()
    expect(input.className).toContain('disabled:placeholder:text-input-disabled')
    expect(icon?.className).toContain('text-input-disabled')
    expect(icon?.className).not.toContain('text-input-placeholder')
  },
}

export const EnabledWithSearchIcon: StoryObj<typeof SearchInputField> = {
  render: (args) => <SearchInputField {...args} />,
  args: {
    placeholder: 'Search people and organizations',
    'aria-label': 'Search people and organizations',
  },
  play: async ({ canvasElement }) => {
    const icon = canvasElement.querySelector('svg')

    expect(icon?.className).toContain('text-input-placeholder')
    expect(icon?.className).not.toContain('text-input-disabled')
  },
}
