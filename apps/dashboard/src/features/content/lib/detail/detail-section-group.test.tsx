import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { DetailSectionGroup } from './detail-section-group.client'

describe('DetailSectionGroup', () => {
  it('renders label via Eyebrow size=sm and preserves children', () => {
    const { container } = render(
      <DetailSectionGroup label="Districts">
        <p>Row content</p>
      </DetailSectionGroup>,
    )

    const label = screen.getByText('Districts')
    expect(label.tagName).toBe('P')
    expect(label).toHaveClass('eyebrow-style-sm', 'text-muted-foreground')
    expect(screen.getByText('Row content')).toBeInTheDocument()
    expect(container.firstElementChild).toHaveClass(
      'border-b',
      'border-border-subtle',
      'px-4',
      'py-2',
      'last:border-b-0',
    )
  })

  it('omits eyebrow chrome when label is absent', () => {
    const { container } = render(
      <DetailSectionGroup>
        <p>Row content</p>
      </DetailSectionGroup>,
    )

    expect(screen.getByText('Row content')).toBeInTheDocument()
    expect(container.querySelector('.eyebrow-style-sm')).not.toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <DetailSectionGroup label="Governed by">
        <p>The Monarchy</p>
      </DetailSectionGroup>,
    )

    await expectNoAxeViolations(container)
  })
})
