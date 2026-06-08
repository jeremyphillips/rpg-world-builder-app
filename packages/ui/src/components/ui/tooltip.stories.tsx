import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  InfoTooltip,
} from './tooltip.client'
import { Button } from './button.client'
import { Field } from './field.client'
import { Input } from './input.client'

const meta = {
  title: 'Forms/Tooltip',
  component: InfoTooltip,
  args: {
    'aria-label': 'About this field',
    children: 'Visible to the rest of your party.',
  },
} satisfies Meta<typeof InfoTooltip>

export default meta
type Story = StoryObj<typeof meta>

/** The `[i]` info pattern: hover or focus the icon to reveal the tooltip. */
export const Info: Story = {}

/** The compound parts wrapping any trigger; needs a single `TooltipProvider`. */
export const Compound: StoryObj = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>Tooltips open on hover and keyboard focus.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
}

/** The intended in-context usage: `Field label [i]`. */
export const InFieldLabel: StoryObj = {
  render: () => (
    <Field.Root id="alignment">
      <Field.Label>
        Alignment
        <InfoTooltip aria-label="About alignment">
          A shorthand for your character&apos;s moral compass.
        </InfoTooltip>
      </Field.Label>
      <Field.Control>
        <Input placeholder="True Neutral" />
      </Field.Control>
    </Field.Root>
  ),
}
