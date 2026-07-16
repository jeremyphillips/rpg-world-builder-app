import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { CharacterImportPreviewRow } from './character-import-preview-row.client'

describe('CharacterImportPreviewRow', () => {
  it('renders undefined values in an error tone with a reason', () => {
    render(
      <CharacterImportPreviewRow
        field="alignment"
        label="Alignment"
        displayValue="Undefined"
        result={{
          status: 'missing-source',
          sourcePaths: ['data.alignmentId'],
          issues: ['Alignment is not set on the source character.'],
        }}
      />,
    )

    expect(screen.getByText('Undefined')).toBeInTheDocument()
    expect(screen.getByText('Alignment is not set on the source character.')).toBeInTheDocument()
  })
})
