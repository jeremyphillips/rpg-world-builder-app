import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { RichTextLinkPreviewCard } from './rich-text-link-preview-card.client'

describe('RichTextLinkPreviewCard', () => {
  it('renders compact content metadata', () => {
    render(<RichTextLinkPreviewCard contentType="spell" title="Fireball" sourceLabel="Homebrew" />)
    expect(screen.getByText('Spell')).toBeInTheDocument()
    expect(screen.getByText('Fireball')).toBeInTheDocument()
    expect(screen.getByText('Homebrew')).toBeInTheDocument()
  })

  it('uses a resolved eyebrow label when provided', () => {
    render(<RichTextLinkPreviewCard contentType="spell" eyebrowLabel="Cantrip" title="Fireball" />)
    expect(screen.getByText('Cantrip')).toBeInTheDocument()
    expect(screen.queryByText('Spell')).not.toBeInTheDocument()
  })

  it('uses title for overview rows and keeps eyebrow as content type', () => {
    render(<RichTextLinkPreviewCard contentType="feat" title="Feat Overview" />)
    expect(screen.getByText('Feat')).toBeInTheDocument()
    expect(screen.getByText('Feat Overview')).toBeInTheDocument()
  })

  it('renders the content type with xs Eyebrow typography', () => {
    render(<RichTextLinkPreviewCard contentType="spell" title="Fireball" />)
    expect(screen.getByText('Spell')).toHaveClass('eyebrow-style-xs')
  })

  it('supports selection via a button root', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <RichTextLinkPreviewCard
        contentType="spell"
        title="Fireball"
        sourceLabel="Homebrew"
        onSelect={onSelect}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Spell Fireball Homebrew/i }))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('supports clear via endSlot on a div root', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    render(
      <RichTextLinkPreviewCard
        contentType="spell"
        title="Fireball"
        sourceLabel="Homebrew"
        onClear={onClear}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Clear selected internal link' }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <RichTextLinkPreviewCard contentType="spell" title="Fireball" sourceLabel="Homebrew" />,
    )
    await expectNoAxeViolations(container)
  })
})
