import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { CharacterImportNarrativePreviewSection } from './character-import-narrative-preview'

describe('CharacterImportNarrativePreviewSection', () => {
  it('renders each narrative child as not set when the source is missing', () => {
    render(
      <CharacterImportNarrativePreviewSection
        result={{
          status: 'missing-source',
          sourcePaths: ['data.traits', 'data.notes.backstory'],
          issues: ['No personal narrative fields were present in the source character.'],
        }}
      />,
    )

    expect(screen.getAllByText('Not set')).toHaveLength(5)
    expect(screen.getByText('Ideals')).toBeInTheDocument()
    expect(screen.getByText('Bonds')).toBeInTheDocument()
  })
})
