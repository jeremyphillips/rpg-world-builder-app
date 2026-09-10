import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { HERO_CONTENT_TYPES, PRIMARY_CTA_LABEL, SECONDARY_CTA_LABEL } from './landing-content'
import { LandingHero } from './landing-hero'

describe('LandingHero', () => {
  it('renders the headline as the page h1', () => {
    render(<LandingHero />)

    expect(screen.getByRole('heading', { level: 1, name: /forge worlds/i })).toBeInTheDocument()
  })

  it('links the primary CTA to signup and the secondary CTA to login', () => {
    render(<LandingHero />)

    expect(screen.getByRole('link', { name: PRIMARY_CTA_LABEL })).toHaveAttribute('href', '/signup')
    expect(screen.getByRole('link', { name: SECONDARY_CTA_LABEL })).toHaveAttribute(
      'href',
      '/login',
    )
  })

  it('lists every authorable content type', () => {
    render(<LandingHero />)

    const list = screen.getByRole('list', { name: /content you can author/i })
    for (const contentType of HERO_CONTENT_TYPES) {
      expect(list).toHaveTextContent(contentType)
    }
  })
})
