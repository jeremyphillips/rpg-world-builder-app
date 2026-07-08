import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { X } from 'lucide-react'

import { Button } from './button.client'
import { PreviewCard } from './preview-card.client'

const meta = {
  title: 'UI/PreviewCard',
  component: PreviewCard,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PreviewCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    eyebrow: 'Grant template',
    title: 'Skill proficiency',
    description: 'Grant proficiency with specific skills or a player choice from a pool.',
  },
}

export const Selectable: Story = {
  args: {
    eyebrow: 'Spell',
    title: 'Fireball',
    description: 'Homebrew',
    interactive: true,
    onSelect: action('onSelect'),
  },
}

export const TransparentSelectable: Story = {
  args: {
    tone: 'transparent',
    title: 'Movement bonus',
    description: 'Grant a movement speed, increase a speed, or match one speed to another.',
    interactive: true,
    onSelect: action('onSelect'),
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm rounded-md border border-border p-1">
        <Story />
      </div>
    ),
  ],
}

export const ComfortableDensity: Story = {
  args: {
    density: 'comfortable',
    title: 'Feat choice',
    description: 'Let the player choose from a feat category.',
    interactive: true,
    onSelect: action('onSelect'),
  },
}

export const DescriptionInline: Story = {
  args: {
    title: 'Fireball',
    description: 'Homebrew',
    descriptionInline: true,
    interactive: true,
    onSelect: action('onSelect'),
  },
}

export const SelectedTone: Story = {
  args: {
    tone: 'selected',
    eyebrow: 'Feat',
    title: 'Feat Overview',
  },
}

export const WithEndSlotControls: Story = {
  args: {
    tone: 'selected',
    eyebrow: 'Spell',
    title: 'Fireball',
    description: 'Homebrew',
  },
  render: (args) => (
    <PreviewCard
      {...args}
      endSlot={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label="Clear selection"
          onClick={action('onClear')}
        >
          <X className="size-3.5" aria-hidden />
        </Button>
      }
    />
  ),
}

export const WithSlots: Story = {
  args: {
    startSlot: <span className="mt-0.5 text-muted-foreground">⋮⋮</span>,
    eyebrow: 'Proficiencies',
    title: 'Weapon proficiency',
    description: 'Specific weapons, category, or player choice.',
    footerSlot: (
      <span className="text-xs text-muted-foreground">Already added to this feature</span>
    ),
    tone: 'transparent',
    interactive: true,
    onSelect: action('onSelect'),
  },
}
