import type { Meta, StoryObj } from '@storybook/react-vite'

import { RadioGroup, RadioGroupItem } from './radio-group.client'

const meta = {
  title: 'Forms/Controls/RadioGroup',
  component: RadioGroup,
  render: (args) => (
    <RadioGroup aria-label="Difficulty" {...args}>
      <div className="flex items-center gap-2">
        <RadioGroupItem id="easy" value="easy" />
        <label htmlFor="easy" className="text-sm">
          Easy
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem id="normal" value="normal" />
        <label htmlFor="normal" className="text-sm">
          Normal
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem id="deadly" value="deadly" />
        <label htmlFor="deadly" className="text-sm">
          Deadly
        </label>
      </div>
    </RadioGroup>
  ),
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithSelection: Story = { args: { defaultValue: 'normal' } }

export const Disabled: Story = { args: { disabled: true, defaultValue: 'normal' } }
