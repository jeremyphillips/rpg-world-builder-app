import type { Meta, StoryObj } from '@storybook/react-vite'
import type { VocabularyUsageReference } from '@rpg/contracts'

import { UsageReferencesSection } from './usage-references-section.client'

const SAMPLE_REFERENCES: VocabularyUsageReference[] = Array.from({ length: 12 }, (_, index) => ({
  kind: 'content',
  contentTypeKey: 'species',
  id: `species-${index + 1}`,
  label: `Species ${index + 1}`,
  slug: `species-${index + 1}`,
}))

const meta = {
  title: 'Shared/UsageReferences/UsageReferencesSection',
  component: UsageReferencesSection,
  parameters: { layout: 'padded' },
  args: {
    campaignId: 'campaign-1',
  },
} satisfies Meta<typeof UsageReferencesSection>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    references: [],
  },
}

export const WithReferences: Story = {
  args: {
    references: SAMPLE_REFERENCES.slice(0, 3),
  },
}

export const ManyReferences: Story = {
  args: {
    references: SAMPLE_REFERENCES,
  },
}
