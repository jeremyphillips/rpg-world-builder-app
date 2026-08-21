import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { CharacterImportSpellsPreviewSection } from '../character-import-spells-preview'

describe('CharacterImportSpellsPreviewSection', () => {
  it('groups supported spells above unsupported entries', () => {
    render(
      <CharacterImportSpellsPreviewSection
        result={{
          status: 'mapped',
          value: [
            {
              sourceValue: 'Light',
              sourceLevel: 0,
              status: 'mapped',
              localValue: 'srd-cc-5.2.1:light',
            },
            {
              sourceValue: 'Custom Spell',
              sourceLevel: 1,
              status: 'unresolved-reference',
            },
          ],
          sourcePaths: ['data.classSpells'],
          issues: [],
        }}
      />,
    )

    expect(screen.getByText('Light (cantrip)')).toBeInTheDocument()
    expect(screen.getByText('Unsupported:')).toBeInTheDocument()
    expect(screen.getByText('Custom Spell (level 1)')).toBeInTheDocument()
  })
})
