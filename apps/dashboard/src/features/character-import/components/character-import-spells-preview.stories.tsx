import type { Meta, StoryObj } from '@storybook/react-vite'

import { CharacterImportSpellsPreviewSection } from './character-import-spells-preview'

const meta = {
  title: 'Dashboard/Character Import/Spells Preview',
  component: CharacterImportSpellsPreviewSection,
} satisfies Meta<typeof CharacterImportSpellsPreviewSection>

export default meta

type Story = StoryObj<typeof meta>

export const CatalogMatched: Story = {
  args: {
    result: {
      status: 'mapped',
      value: [
        {
          sourceValue: 'Light',
          sourceLevel: 0,
          status: 'mapped',
          localValue: 'srd-cc-5.2.1:light',
        },
        {
          sourceValue: 'Magic Missile',
          sourceLevel: 1,
          status: 'mapped',
          localValue: 'srd-cc-5.2.1:magic-missile',
        },
      ],
      sourcePaths: ['data.classSpells'],
      issues: [],
    },
  },
}
