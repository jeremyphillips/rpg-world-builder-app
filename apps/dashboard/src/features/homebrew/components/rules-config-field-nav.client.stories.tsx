import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'

import { RulesConfigFieldNav } from './rules-config-field-nav.client'

const meta = {
  title: 'Layout/Homebrew/RulesConfigFieldNav',
  component: RulesConfigFieldNav,
  parameters: { layout: 'padded' },
  decorators: [
    (Story: () => React.JSX.Element) => (
      <MemoryRouter>
        <div className="max-w-xs">
          <Story />
        </div>
      </MemoryRouter>
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
