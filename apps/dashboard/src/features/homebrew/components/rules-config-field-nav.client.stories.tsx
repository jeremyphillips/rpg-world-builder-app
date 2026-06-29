import type { Meta, StoryObj } from '@storybook/react-vite'

import { CHARACTER_CONFIGURATION_SECTIONS } from '@/features/campaign'

import { RulesConfigFieldNav } from './rules-config-field-nav.client'

const meta = {
  title: 'Layout/Homebrew/RulesConfigFieldNav',
  component: RulesConfigFieldNav,
  parameters: { layout: 'padded' },
  args: {
    sections: CHARACTER_CONFIGURATION_SECTIONS,
    navLabel: 'Character configuration sections',
    mobileSelectLabel: 'Character configuration section',
  },
  decorators: [
    (Story: () => React.JSX.Element) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RulesConfigFieldNav>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ActiveSection: Story = {
  args: {
    activeSectionId: 'extended-progression',
  },
}
