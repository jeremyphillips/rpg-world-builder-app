import type { Meta, StoryObj } from '@storybook/react-vite'
import { action } from 'storybook/actions'

import { RadioCard } from './radio-card.client'

const options = [
  {
    label: 'Modern 5e',
    value: '5e',
    badge: 'Recommended',
    description:
      'A familiar modern fantasy rules framework with ascending armor class, proficiency-based advancement, ability checks, saving throws, and standardized d20 combat.',
    meta: ['Ascending AC', 'Proficiency bonus', 'Ability checks', 'Saving throws'],
  },
  {
    label: 'Modern 3e',
    value: '3e',
    description:
      'A detailed d20 framework with ascending armor class, attack bonuses, Fortitude/Reflex/Will saves, skill ranks, feats, and more granular character customization.',
    meta: ['Ascending AC', 'Attack bonuses', 'Fort/Ref/Will', 'Skills & feats'],
  },
  {
    label: 'Classic Basic',
    value: 'becmi',
    description:
      'Fast old-school play with descending armor class, class tables, simple saves, and lightweight character options.',
    meta: ['Descending AC', 'Class tables', 'Simple saves'],
  },
]

const meta = {
  title: 'Forms/Controls/RadioCard',
  component: RadioCard,
  args: {
    'aria-label': 'Edition preset',
    options,
  },
} satisfies Meta<typeof RadioCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithSelection: Story = { args: { defaultValue: '5e' } }

export const Disabled: Story = { args: { disabled: true, defaultValue: '5e' } }

export const SingleOption: Story = {
  args: {
    options: [
      {
        label: 'Modern 5e',
        value: '5e',
        badge: 'Recommended',
        description:
          'A familiar modern fantasy rules framework with ascending armor class, proficiency-based advancement, ability checks, saving throws, and standardized d20 combat.',
        meta: ['Ascending AC', 'Proficiency bonus', 'Ability checks', 'Saving throws'],
      },
    ],
  },
}

const gridOptions = [
  {
    label: 'Modern 5e',
    value: '5e',
    badge: 'Recommended',
    description: 'Familiar modern fantasy with proficiency-based advancement and d20 combat.',
    meta: ['Ascending AC', 'Proficiency bonus'],
  },
  {
    label: 'Modern 3e',
    value: '3e',
    description: 'Detailed d20 framework with skills, feats, and granular customization.',
    meta: ['Fort/Ref/Will', 'Skills & feats'],
  },
  {
    label: 'Pathfinder 2e',
    value: 'pf2e',
    description: 'Tactical three-action combat with degrees of success and modular feats.',
    meta: ['Three actions', 'Degrees of success'],
  },
  {
    label: 'Classic Basic',
    value: 'becmi',
    description: 'Fast old-school play with descending armor class and simple saves.',
    meta: ['Descending AC', 'Class tables'],
  },
]

export const RadioOnRightTwoColumnGrid: Story = {
  args: {
    controlPosition: 'right',
    className: 'grid-cols-1 sm:grid-cols-2',
    options: gridOptions,
    defaultValue: '5e',
  },
}

const compactBuilderOptions = [
  {
    label: 'Dwarf',
    value: 'dwarf',
    description: 'Humanoid',
    summaryItems: ['Darkvision', 'Dwarven Resilience', 'Forge Wise'],
    onDetails: action('onDetails'),
  },
  {
    label: 'Dragonborn',
    value: 'dragonborn',
    description: 'Humanoid',
    onDetails: action('onDetails'),
  },
  {
    label: 'Fighter',
    value: 'fighter',
    description: 'Strength · d10 Hit Die',
  },
]

/** Builder species/class cards: compact density, inline summary, optional Details. */
export const Compact: Story = {
  args: {
    'aria-label': 'Character builder option',
    density: 'compact',
    options: compactBuilderOptions,
    defaultValue: 'dwarf',
  },
}

/** Builder dependent-choice cards: stacked grant summaries. */
export const DependentChoice: Story = {
  args: {
    'aria-label': 'Elven Lineage',
    density: 'compact',
    defaultValue: 'drow',
    options: [
      {
        label: 'Drow',
        value: 'drow',
        summaryLines: [
          'L1: Darkvision 120 ft · Dancing Lights cantrip',
          'L3: Faerie Fire spell',
          'L5: Darkness spell',
        ],
      },
      {
        label: 'High Elf',
        value: 'high-elf',
        summaryLines: [
          'L1: Prestidigitation cantrip',
          'L3: Detect Magic spell',
          'L5: Misty Step spell',
        ],
      },
    ],
  },
}

/** Configuration-panel radio rows: lighter chrome than parent species cards. */
export const RowVariant: Story = {
  args: {
    'aria-label': 'Elven Lineage',
    variant: 'row',
    density: 'compact',
    defaultValue: 'drow',
    options: [
      {
        label: 'Drow',
        value: 'drow',
        summaryLines: [
          'L1: Darkvision 120 ft · Dancing Lights cantrip',
          'L3: Faerie Fire spell',
          'L5: Darkness spell',
        ],
      },
      {
        label: 'High Elf',
        value: 'high-elf',
        summaryLines: [
          'L1: Prestidigitation cantrip',
          'L3: Detect Magic spell',
          'L5: Misty Step spell',
        ],
      },
    ],
  },
}

/** Parent species card with inline titleMeta. */
export const ParentChoiceTitleMeta: Story = {
  args: {
    'aria-label': 'Species',
    density: 'compact',
    defaultValue: 'elf',
    options: [
      {
        label: 'Elf',
        value: 'elf',
        description: 'Humanoid',
        titleMeta: 'Heritage required',
        summaryItems: ['Darkvision', 'Fey Ancestry', 'Keen Senses', 'Trance'],
        onDetails: action('onDetails'),
      },
    ],
  },
}

/** Selected parent card revealing a dependent-choice region inside the shell. */
export const EmbeddedDependentChoice: Story = {
  args: {
    'aria-label': 'Species',
    density: 'compact',
    defaultValue: 'gnome',
    options: [
      {
        label: 'Gnome',
        value: 'gnome',
        description: 'Humanoid',
        titleMeta: 'Heritage required',
        summaryItems: ['Darkvision', 'Gnomish Cunning'],
        onDetails: action('onDetails'),
        embeddedSlotTone: 'panel',
        embeddedContent: (
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold">Gnomish Lineage</p>
              <p className="text-sm text-muted-foreground">Required</p>
            </div>
            <p className="text-sm text-muted-foreground">Choose one option.</p>
          </div>
        ),
      },
      {
        label: 'Dwarf',
        value: 'dwarf',
        description: 'Humanoid',
        summaryItems: ['Darkvision', 'Dwarven Resilience'],
        onDetails: action('onDetails'),
      },
    ],
  },
}
