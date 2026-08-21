import type { Meta, StoryObj } from '@storybook/react-vite'

import { VocabularyEntrySheet } from './vocabulary-entry-sheet'

const editEntry = {
  id: 'fey-kin',
  label: 'Fey Kin',
  description: 'Otherworldly ancestry.',
  source: 'campaign' as const,
  status: 'active' as const,
  usedBy: 2,
}

const meta = {
  title: 'Game Terms/VocabularyEntrySheet',
  component: VocabularyEntrySheet,
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    onOpenChange: () => undefined,
    campaignId: 'camp_1',
    setId: 'creature-types' as const,
    createHeadline: 'Add creature type',
    isPending: false,
    onSubmit: async () => undefined,
  },
} satisfies Meta<typeof VocabularyEntrySheet>

export default meta
type Story = StoryObj<typeof meta>

/** G5 canonical: fresh create form in ContentFormDrawer. */
export const CreateOpen: Story = {
  args: {
    mode: 'create',
  },
}

/** G5 canonical: edit session with entry defaults. */
export const EditOpen: Story = {
  args: {
    mode: 'edit',
    entry: editEntry,
  },
}

/** G5 canonical: pending submit disables dismissal controls. */
export const Pending: Story = {
  args: {
    mode: 'create',
    isPending: true,
  },
}
