import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FilenamePreview } from './filename-preview.client'

describe('FilenamePreview', () => {
  it('renders the full filename in full mode', () => {
    render(<FilenamePreview filename="seraphina-final-character-portrait.webp" full />)
    expect(screen.getByText('seraphina-final-character-portrait.webp')).toBeInTheDocument()
  })

  it('repairs mojibake before truncating', () => {
    render(<FilenamePreview filename={'DALL\u00C2\u00B7E-2024-armor-.webp'} density="metadata" />)
    expect(screen.getByText(/DALL·E-202/)).toBeInTheDocument()
    expect(screen.queryByText(/DALLÂ·E/)).not.toBeInTheDocument()
  })

  it('truncates long filenames and exposes the full name for assistive tech', () => {
    render(<FilenamePreview filename="seraphina-final-character-portrait.webp" />)
    const preview = screen.getByText(/seraphina-final/)
    expect(preview.textContent).toContain('…')
    expect(preview.textContent).toContain('-portrait.webp')
    expect(preview).toHaveAttribute('tabindex', '0')
  })
})
