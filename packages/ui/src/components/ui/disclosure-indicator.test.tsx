import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'

import { DisclosureIndicator } from './disclosure-indicator.client'

describe('DisclosureIndicator', () => {
  it('renders chevron-down with disclosure rotation hook', () => {
    const { container } = render(<DisclosureIndicator size="lg" />)
    const svg = container.querySelector('[data-icon="chevron-down"]')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveClass('ui-icon--lg')
    expect(svg).toHaveClass('[[data-state=open]_&]:rotate-180')
  })
})
