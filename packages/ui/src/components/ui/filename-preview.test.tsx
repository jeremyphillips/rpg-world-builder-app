import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FilenamePreview } from './filename-preview.client'

describe('FilenamePreview', () => {
  it('renders the full filename in full mode', () => {
    render(<FilenamePreview filename="seraphina-final-character-portrait.webp" full />)
    expect(screen.getByText('seraphina-final-character-portrait.webp')).toBeInTheDocument()
  })

  it('truncates long filenames and exposes the full name for assistive tech', () => {
    render(<FilenamePreview filename="seraphina-final-character-portrait.webp" />)
    const preview = screen.getByText(/seraphina-final/)
    expect(preview.textContent).toContain('…')
    expect(preview.textContent).toContain('-portrait.webp')
    expect(preview).toHaveAttribute('tabindex', '0')
  })
})
