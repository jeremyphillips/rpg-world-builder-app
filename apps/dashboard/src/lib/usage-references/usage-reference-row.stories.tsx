import type { Meta, StoryObj } from '@storybook/react-vite'
import type { VocabularyUsageReference } from '@rpg/contracts'

import { UsageReferenceRow } from './usage-reference-row'

const meta = {
  title: 'Shared/UsageReferences/UsageReferenceRow',
  component: UsageReferenceRow,
  parameters: { layout: 'padded' },
  args: {
    campaignId: 'campaign-1',
    reference: {
      kind: 'content',
      contentTypeKey: 'species',
      id: 'species-1',
      label: 'Elf',
      slug: 'elf',
    } satisfies VocabularyUsageReference,
  },
} satisfies Meta<typeof UsageReferenceRow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
