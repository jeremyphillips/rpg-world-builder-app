import type { Meta, StoryObj } from '@storybook/react-vite'
import { Plus, Settings } from 'lucide-react'

import { Button } from './button.client'
import {
  controlActionCompactIconClasses,
  controlActionCompactTextClasses,
  controlActionCompactTextWithIconClasses,
  controlActionDefaultIconClasses,
} from './control-action.variants'

const meta = {
  title: 'Design tokens/Control action',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const HitTargetPairings: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <button type="button" aria-label="Compact icon" className={controlActionCompactIconClasses}>
        <Plus aria-hidden />
      </button>
      <button type="button" className={controlActionCompactTextClasses}>
        View
      </button>
      <button type="button" className={controlActionCompactTextWithIconClasses}>
        <Settings aria-hidden />
        Compact text
      </button>
      <button type="button" aria-label="Default icon" className={controlActionDefaultIconClasses}>
        <Settings aria-hidden />
      </button>
    </div>
  ),
}

export const ButtonIntegration: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="icon" density="compact" aria-label="Remove">
        <Plus aria-hidden />
      </Button>
      <Button size="sm" density="compact">
        <Settings aria-hidden />
        Compact
      </Button>
      <Button size="icon" aria-label="Settings">
        <Settings aria-hidden />
      </Button>
    </div>
  ),
}
