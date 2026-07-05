import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  CharacterBuilderPreviewSectionContent,
  CharacterBuilderPreviewSubsection,
  CharacterBuilderPreviewSubsectionHint,
} from './character-builder-preview-section-content.client'

const meta = {
  title: 'Character Builder/CharacterBuilderPreviewSectionContent',
  component: CharacterBuilderPreviewSectionContent,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CharacterBuilderPreviewSectionContent>

export default meta
type Story = StoryObj<typeof CharacterBuilderPreviewSectionContent>

export const SubsectionsLayout: Story = {
  render: () => (
    <div className="max-w-xs rounded-lg border border-border bg-muted/20">
      <CharacterBuilderPreviewSectionContent
        layout="subsections"
        hint="Choose a class to see options"
      >
        <CharacterBuilderPreviewSubsection title="Saving throws">
          <CharacterBuilderPreviewSubsectionHint>
            Class saving throws appear after you choose a class.
          </CharacterBuilderPreviewSubsectionHint>
        </CharacterBuilderPreviewSubsection>
        <CharacterBuilderPreviewSubsection title="Skills">
          <CharacterBuilderPreviewSubsectionHint>
            No skills chosen yet.
          </CharacterBuilderPreviewSubsectionHint>
        </CharacterBuilderPreviewSubsection>
        <CharacterBuilderPreviewSubsection title="Tools">
          <CharacterBuilderPreviewSubsectionHint>
            No tool proficiencies yet.
          </CharacterBuilderPreviewSubsectionHint>
        </CharacterBuilderPreviewSubsection>
      </CharacterBuilderPreviewSectionContent>
    </div>
  ),
}

export const DefaultLayout: Story = {
  render: () => (
    <div className="max-w-xs rounded-lg border border-border bg-muted/20">
      <CharacterBuilderPreviewSectionContent>
        <CharacterBuilderPreviewSubsectionHint>
          Choose starting equipment.
        </CharacterBuilderPreviewSubsectionHint>
      </CharacterBuilderPreviewSectionContent>
    </div>
  ),
}
