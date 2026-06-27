import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import { RichTextLinkPreviewCard } from './rich-text-link-preview-card.client'

describe('RichTextLinkPreviewCard', () => {
  it('renders compact content metadata', () => {
    render(<RichTextLinkPreviewCard contentType="spell" title="Fireball" sourceLabel="Homebrew" />)
    expect(screen.getByText('Spell')).toBeInTheDocument()
    expect(screen.getByText('Fireball')).toBeInTheDocument()
    expect(screen.getByText('Homebrew')).toBeInTheDocument()
  })

  it('uses title for overview rows and keeps eyebrow as content type', () => {
    render(<RichTextLinkPreviewCard contentType="feat" title="Feat Overview" />)
    expect(screen.getByText('Feat')).toBeInTheDocument()
    expect(screen.getByText('Feat Overview')).toBeInTheDocument()
  })

  it('renders the content type with xs Eyebrow typography', () => {
    render(<RichTextLinkPreviewCard contentType="spell" title="Fireball" />)
    expect(screen.getByText('Spell')).toHaveClass('text-eyebrow-xs', 'tracking-eyebrow-xs')
  })

  it('supports selection and clear actions', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onClear = vi.fn()
    render(
      <RichTextLinkPreviewCard
        contentType="spell"
        title="Fireball"
        sourceLabel="Homebrew"
        onSelect={onSelect}
        onClear={onClear}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Spell Fireball Homebrew/i }))
    await user.click(screen.getByRole('button', { name: 'Clear selected internal link' }))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <RichTextLinkPreviewCard contentType="spell" title="Fireball" sourceLabel="Homebrew" />,
    )
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
