import type { Meta, StoryObj } from '@storybook/react-vite'

import { CharacterImportPreviewRow } from './character-import-preview-row.client'

const meta = {
  title: 'Dashboard/Character Import/Preview Row',
  component: CharacterImportPreviewRow,
} satisfies Meta<typeof CharacterImportPreviewRow>

export default meta

type Story = StoryObj<typeof meta>

export const Mapped: Story = {
  args: {
    field: 'name',
    label: 'Name',
    displayValue: 'Presto',
    result: {
      status: 'mapped',
      value: 'Presto',
      sourcePaths: ['data.name'],
      issues: [],
    },
  },
}

export const Missing: Story = {
  args: {
    field: 'alignment',
    label: 'Alignment',
    displayValue: 'Not set',
    result: {
      status: 'missing-source',
      sourcePaths: ['data.alignmentId'],
      issues: ['Alignment is not set on the source character.'],
    },
  },
}
