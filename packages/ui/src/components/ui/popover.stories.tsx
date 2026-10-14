import type { Meta, StoryObj } from '@storybook/react'

import { Button } from './button.client'
import { Popover, PopoverContent, PopoverTrigger } from './popover.client'

const meta = {
  title: 'Overlays/Popover',
  component: Popover,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Popover>

export default meta

type Story = StoryObj<typeof Popover>

export const WithArrowRight: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button">Open right</Button>
      </PopoverTrigger>
      <PopoverContent side="right" arrow className="p-3">
        Popover with arrow
      </PopoverContent>
    </Popover>
  ),
}

export const WithArrowLeft: Story = {
  render: () => (
    <div className="flex w-[min(100vw,48rem)] justify-end">
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button">Open left</Button>
        </PopoverTrigger>
        <PopoverContent side="left" arrow className="p-3">
          Flipped to the left
        </PopoverContent>
      </Popover>
    </div>
  ),
}
