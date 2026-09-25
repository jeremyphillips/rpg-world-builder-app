import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { MediaImage } from './media-image.client'
import { MediaCompactPreview } from './media-compact-preview.client'

describe('MediaImage', () => {
  it('reserves layout dimensions for placeholders', () => {
    const { container } = render(<MediaImage alt="Hero" />)
    expect(container.firstElementChild).toHaveClass('size-16')
    expect(screen.getByRole('img', { name: 'Image unavailable' })).toBeInTheDocument()
  })

  it('allows intentionally empty alt text for decorative crops', () => {
    const { container } = render(<MediaImage src="/sample.webp" alt="" />)
    const image = container.querySelector('img')
    expect(image).toHaveAttribute('aria-hidden', 'true')
    expect(image).toHaveAttribute('alt', '')
  })

  itAxe('has no axe accessibility violations for placeholder state', async () => {
    const { container } = render(<MediaImage alt="Preview" />)
    await expectNoAxeViolations(container)
  })
})

describe('MediaCompactPreview', () => {
  it('uses resolver alt text by default', () => {
    render(
      <MediaCompactPreview
        presentation={{
          kind: 'rendition',
          preset: 'compact-identity',
          alt: 'Resolved alt',
        }}
        src="/sample.webp"
      />,
    )

    expect(screen.getByRole('img', { name: 'Resolved alt' })).toBeInTheDocument()
  })
})
