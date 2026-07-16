import type { Meta, StoryObj } from '@storybook/react-vite'

import { CharacterImportDispositionReport } from './character-import-disposition-report.client'

const meta = {
  title: 'Dashboard/Character Import/Disposition Report',
  component: CharacterImportDispositionReport,
} satisfies Meta<typeof CharacterImportDispositionReport>

export default meta

type Story = StoryObj<typeof meta>

export const IgnoredSavingThrows: Story = {
  args: {
    dispositions: [
      {
        sourcePath: 'data.modifiers.class[0]',
        sourceValue: 'intelligence-saving-throws',
        targetPath: 'proficiencies.savingThrows',
        disposition: 'ignored',
        reason: 'resolved-from-local-content',
        message: 'Saving throw proficiencies are resolved from the selected local class.',
      },
      {
        sourcePath: 'data.modifiers.class[1]',
        sourceValue: 'wisdom-saving-throws',
        targetPath: 'proficiencies.savingThrows',
        disposition: 'ignored',
        reason: 'resolved-from-local-content',
        message: 'Saving throw proficiencies are resolved from the selected local class.',
      },
    ],
  },
}

export const NoUnsupportedFields: Story = {
  args: {
    dispositions: IgnoredSavingThrows.args.dispositions,
  },
}
