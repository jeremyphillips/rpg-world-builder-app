import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'

import { RichTextEditor } from './rich-text-editor.client'

describe('RichTextEditor', () => {
  it('renders the bold and italic toolbar buttons with accessible names', () => {
    render(<RichTextEditor aria-label="Biography" />)
    expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Italic' })).toBeInTheDocument()
  })

  it('hides the link button unless linkable is set', () => {
    const { rerender } = render(<RichTextEditor aria-label="Biography" />)
    expect(screen.queryByRole('button', { name: 'Link' })).not.toBeInTheDocument()
    rerender(<RichTextEditor aria-label="Biography" linkable />)
    expect(screen.getByRole('button', { name: 'Link' })).toBeInTheDocument()
  })

  it('applies prose classes to the editable surface', async () => {
    render(<RichTextEditor aria-label="Biography" />)
    const surface = await screen.findByRole('textbox')
    expect(surface).toHaveClass('prose', 'prose-sm', 'max-w-none')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<RichTextEditor aria-label="Biography" />)
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
