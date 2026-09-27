import { useState, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { GameTermDetailMediaField } from './game-term-detail-media-field'

const entry = {
  id: 'evocation',
  label: 'Evocation',
  description: 'Energy and raw magical force.',
  source: 'system' as const,
  status: 'active' as const,
  usedBy: 12,
}

function WithQueryClient({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={client}>
      <div className="max-w-sm p-4">{children}</div>
    </QueryClientProvider>
  )
}

const meta = {
  title: 'Game Terms/GameTermDetailMediaField',
  component: GameTermDetailMediaField,
  parameters: { layout: 'centered' },
  render: (args) => (
    <WithQueryClient>
      <GameTermDetailMediaField {...args} />
    </WithQueryClient>
  ),
  args: {
    campaignId: 'camp_demo',
    setId: 'spell-schools' as const,
    entry,
    singularLabel: 'Spell school',
    rulesetId: 'srd-cc-5.2.1',
    readOnly: true,
    onSave: async () => undefined,
  },
} satisfies Meta<typeof GameTermDetailMediaField>

export default meta
type Story = StoryObj<typeof meta>

export const ReadOnlyWithSystemEmblem: Story = {
  args: {
    readOnly: true,
  },
}

export const Editable: Story = {
  args: {
    readOnly: false,
  },
}
