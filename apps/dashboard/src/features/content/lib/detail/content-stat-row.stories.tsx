import type { Meta, StoryObj } from '@storybook/react-vite'
import { WEAPON_MASTERY_ENTRIES } from '@rpg/contracts'

import { ContentStatRow } from './content-stat-row.client'

const meta = {
  title: 'Content/ContentStatRow',
  component: ContentStatRow,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ContentStatRow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Hit Die',
    value: 'd12 per level',
  },
}

export const WithInfo: Story = {
  args: {
    label: 'Mastery',
    value: WEAPON_MASTERY_ENTRIES.cleave.label,
    info: WEAPON_MASTERY_ENTRIES.cleave.description,
    infoAriaLabel: `About ${WEAPON_MASTERY_ENTRIES.cleave.label}`,
  },
}

export const WithLabelInfo: Story = {
  args: {
    label: 'Ritual',
    value: 'No',
    info: 'When a spell can be cast as a ritual, extend its casting time by 10 minutes to cast it without a spell slot.',
    infoPlacement: 'label',
  },
}

export const LongValue: Story = {
  args: {
    label: 'Skills',
    value: 'Choose 2 from: Animal Handling, Athletics, Intimidation, Nature, Perception, Survival',
  },
}

export const MultipleRows: Story = {
  args: {
    label: 'Hit Die',
    value: 'd12 per level',
  },
  render: () => (
    <div className="space-y-1">
      <ContentStatRow label="Hit Die" value="d12 per level" />
      <ContentStatRow label="Primary Abilities" value="Strength" />
      <ContentStatRow label="Saving Throws" value="Strength, Constitution" />
      <ContentStatRow label="Armor Training" value="Light, Medium, Shields" />
      <ContentStatRow label="Weapons Proficiencies" value="Simple, Martial" />
      <ContentStatRow
        label="Mastery"
        value={WEAPON_MASTERY_ENTRIES.sap.label}
        info={WEAPON_MASTERY_ENTRIES.sap.description}
        infoAriaLabel={`About ${WEAPON_MASTERY_ENTRIES.sap.label}`}
      />
      <ContentStatRow
        label="Skills"
        value="Choose 2 from: Animal Handling, Athletics, Intimidation, Nature, Perception, Survival"
      />
    </div>
  ),
}
