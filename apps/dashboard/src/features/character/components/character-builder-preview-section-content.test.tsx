import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import {
  CharacterBuilderPreviewSectionContent,
  CharacterBuilderPreviewSubsection,
  CharacterBuilderPreviewSubsectionHint,
} from './character-builder-preview-section-content.client'

describe('CharacterBuilderPreviewSectionContent', () => {
  it('renders section hint and bordered subsections', () => {
    render(
      <CharacterBuilderPreviewSectionContent
        layout="subsections"
        hint="Choose a class to see class proficiencies."
      >
        <CharacterBuilderPreviewSubsection title="Skills">
          <CharacterBuilderPreviewSubsectionHint>
            No skills chosen yet.
          </CharacterBuilderPreviewSubsectionHint>
        </CharacterBuilderPreviewSubsection>
      </CharacterBuilderPreviewSectionContent>,
    )

    expect(screen.getByText('Choose a class to see class proficiencies.')).toHaveClass('text-xs')
    expect(screen.getByText('Skills')).toBeInTheDocument()
    expect(screen.getByText('No skills chosen yet.')).toHaveClass('text-xs')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <CharacterBuilderPreviewSectionContent
        layout="subsections"
        hint="Choose a class to see class proficiencies."
      >
        <CharacterBuilderPreviewSubsection title="Saving throws">
          <CharacterBuilderPreviewSubsectionHint>
            Class saving throws appear after you choose a class.
          </CharacterBuilderPreviewSubsectionHint>
        </CharacterBuilderPreviewSubsection>
      </CharacterBuilderPreviewSectionContent>,
    )

    await expectNoAxeViolations(container)
  })
})
