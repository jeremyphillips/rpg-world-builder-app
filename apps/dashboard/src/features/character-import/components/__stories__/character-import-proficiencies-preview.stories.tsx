import type { Meta, StoryObj } from '@storybook/react-vite'

import { CharacterImportProficienciesPreviewSection } from '../character-import-proficiencies-preview'

const meta = {
  title: 'Dashboard/Character Import/Proficiencies Preview',
  component: CharacterImportProficienciesPreviewSection,
} satisfies Meta<typeof CharacterImportProficienciesPreviewSection>

export default meta

type Story = StoryObj<typeof meta>

export const MappedSkillsAndTools: Story = {
  args: {
    result: {
      status: 'mapped',
      sourcePaths: ['data.modifiers'],
      issues: [],
      value: {
        skills: [
          {
            kind: 'skill',
            sourceValue: 'persuasion',
            skillId: 'persuasion',
            localValue: 'persuasion',
            sourceGroup: 'race',
            status: 'mapped',
          },
          {
            kind: 'skill',
            sourceValue: 'arcana',
            skillId: 'arcana',
            localValue: 'arcana',
            sourceGroup: 'class',
            status: 'mapped',
          },
        ],
        tools: [
          {
            kind: 'tool',
            sourceValue: 'calligraphers-supplies',
            toolId: 'srd-cc-5.2.1:calligraphers-supplies',
            toolCategory: 'artisan',
            localValue: 'artisan',
            sourceGroup: 'background',
            status: 'mapped',
          },
        ],
      },
    },
  },
}
