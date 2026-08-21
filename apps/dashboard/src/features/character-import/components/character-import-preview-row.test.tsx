import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { CharacterImportPreviewRow } from './character-import-preview-row'

describe('CharacterImportPreviewRow', () => {
  it('renders missing-source values as muted not-set copy without an issue line', () => {
    render(
      <CharacterImportPreviewRow
        field="alignment"
        label="Alignment"
        displayValue="Not set"
        result={{
          status: 'missing-source',
          sourcePaths: ['data.alignmentId'],
          issues: ['Alignment is not set on the source character.'],
        }}
      />,
    )

    expect(screen.getByText('Not set')).toBeInTheDocument()
    expect(
      screen.queryByText('Alignment is not set on the source character.'),
    ).not.toBeInTheDocument()
  })

  it('renders invalid-source issues in an error tone', () => {
    render(
      <CharacterImportPreviewRow
        field="alignment"
        label="Alignment"
        displayValue="Not set"
        result={{
          status: 'invalid-value',
          sourcePaths: ['data.alignmentId'],
          issues: ['Source alignment id 99 is not recognized.'],
        }}
      />,
    )

    expect(screen.getByText('Source alignment id 99 is not recognized.')).toBeInTheDocument()
  })
})
