import type { Meta, StoryObj } from '@storybook/react-vite'

import { CharacterImportNarrativePreviewSection } from '../character-import-narrative-preview'

const meta = {
  title: 'Dashboard/Character Import/Narrative Preview',
  component: CharacterImportNarrativePreviewSection,
} satisfies Meta<typeof CharacterImportNarrativePreviewSection>

export default meta

type Story = StoryObj<typeof meta>

export const MissingSource: Story = {
  args: {
    result: {
      status: 'missing-source',
      sourcePaths: ['data.traits', 'data.notes.backstory'],
      issues: ['No personal narrative fields were present in the source character.'],
    },
  },
}

export const Partial: Story = {
  args: {
    result: {
      status: 'mapped',
      value: {
        ideals: ['Knowledge is the highest good.'],
        backstory: 'Apprenticed under a reclusive archmage.',
      },
      sourcePaths: ['data.traits.ideals', 'data.notes.backstory'],
      issues: [],
    },
  },
}
