import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CampaignTemplate } from '@rpg/contracts'

import { BLANK_CAMPAIGN_TEMPLATE_VALUE, CampaignTemplateChooser } from './campaign-template-chooser'

const templates: CampaignTemplate[] = [
  {
    metadata: {
      id: 'classic-adventure',
      slug: 'classic-adventure',
      version: '1.0.0',
      name: 'Classic Adventure',
      description: '<p>A flexible heroic-fantasy starting point with room to explore.</p>',
    },
    rulesetId: 'srd-cc-5.2.1',
    defaults: {},
    worldSeedPackIds: [],
  },
]

const meta = {
  title: 'Campaign/CampaignTemplateChooser',
  component: CampaignTemplateChooser,
  args: {
    templates,
    value: BLANK_CAMPAIGN_TEMPLATE_VALUE,
    onValueChange: () => undefined,
  },
} satisfies Meta<typeof CampaignTemplateChooser>

export default meta
type Story = StoryObj<typeof meta>

export const Interactive: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value)
    return <CampaignTemplateChooser {...args} value={value} onValueChange={setValue} />
  },
}

export const LoadFailure: Story = {
  args: { templates: [], isError: true },
}
