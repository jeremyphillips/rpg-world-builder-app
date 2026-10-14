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

const arrowSides = ['top', 'right', 'bottom', 'left'] as const

/** Open all four placements. Collision flips are checked by shrinking the canvas. */
export const ArrowPlacements: Story = {
  render: () => (
    <div className="grid min-h-[28rem] min-w-[36rem] grid-cols-2 place-items-center gap-24 p-16">
      {arrowSides.map((side) => (
        <Popover key={side} defaultOpen>
          <PopoverTrigger asChild>
            <Button type="button">{side}</Button>
          </PopoverTrigger>
          <PopoverContent side={side} arrow className="p-3">
            {side}
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
}
