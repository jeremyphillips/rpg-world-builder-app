import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'

import { RichTextEditor } from './rich-text-editor.client'

describe('RichTextEditor', () => {
  it('renders the bold and italic toolbar buttons with accessible names', () => {
    render(<RichTextEditor aria-label="Biography" />)
    expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Italic' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bulleted list' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ordered list' })).toBeInTheDocument()
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

  it('does not call onChange when mounted with an empty value', async () => {
    const onChange = vi.fn()
    render(<RichTextEditor aria-label="Description" value="" onChange={onChange} />)

    await screen.findByRole('textbox')
    await waitFor(() => expect(onChange).not.toHaveBeenCalled())
  })

  it('does not call onChange when mounted with plain-text catalog content', async () => {
    const onChange = vi.fn()
    render(
      <RichTextEditor
        aria-label="Description"
        value="Jump farther than normal."
        onChange={onChange}
      />,
    )

    await screen.findByRole('textbox')
    await waitFor(() => expect(onChange).not.toHaveBeenCalled())
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<RichTextEditor aria-label="Biography" />)
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })

  it('opens the link panel instead of using a prompt', async () => {
    const user = userEvent.setup()
    render(<RichTextEditor aria-label="Biography" linkable />)

    await user.click(screen.getByRole('button', { name: 'Link' }))

    expect(screen.getByText('Insert link')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Link URL' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Display text' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Insert' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel link insert' })).toBeInTheDocument()
  })
})
