import type { Meta, StoryObj } from '@storybook/react-vite'

import { QuickNpcStartingChoiceSelectedRow } from './quick-npc-starting-choice-selected-row'
import { quickNpcAdditionalEquipmentQuantityClasses } from './quick-npc-starting-choices.variants'

const meta = {
  title: 'Features/Character/Quick NPC/Starting choice selected row',
  component: QuickNpcStartingChoiceSelectedRow,
  args: {
    label: 'Longsword',
    onRemove: () => undefined,
  },
} satisfies Meta<typeof QuickNpcStartingChoiceSelectedRow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithSuggestion: Story = {
  args: {
    label: 'Perception',
    suggestionHint: 'Suggested by Guard role',
    suggestionTitle: 'Suggested by Guard role',
  },
}

export const WithQuantity: Story = {
  args: {
    label: 'Javelin',
    quantity: (
      <span className={quickNpcAdditionalEquipmentQuantityClasses}>
        <span aria-hidden="true">×3</span>
        <span className="sr-only">3 added manually</span>
      </span>
    ),
  },
}
