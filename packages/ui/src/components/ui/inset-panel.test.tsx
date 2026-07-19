import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { InsetPanel } from './inset-panel.client'
import { insetPanelTextVariantBySize } from './inset-panel.variants'
import { textVariants } from './text.variants'

describe('InsetPanel', () => {
  it('applies sunken recess chrome by default', () => {
    const { container } = render(
      <InsetPanel size="sm">
        <InsetPanel.Text>Well copy</InsetPanel.Text>
      </InsetPanel>,
    )

    expect(container.firstChild).toHaveClass('bg-sunken')
    expect(container.firstChild).toHaveClass('shadow-surface-sunken')
  })

  it('applies dashed sunken gate chrome', () => {
    const { container } = render(
      <InsetPanel borderStyle="dashed" surface="sunken" size="lg" align="center">
        <InsetPanel.Text>Gate copy</InsetPanel.Text>
      </InsetPanel>,
    )

    expect(container.firstChild).toHaveClass('border-dashed')
    expect(container.firstChild).toHaveClass('bg-sunken')
    expect(container.firstChild).toHaveClass('shadow-surface-sunken')
    expect(container.firstChild).toHaveClass('text-center')
  })

  it.each(['sm', 'md', 'lg'] as const)('passes size %s to InsetPanel.Text typography', (size) => {
    render(
      <InsetPanel size={size}>
        <InsetPanel.Text>Scaled copy</InsetPanel.Text>
      </InsetPanel>,
    )

    const copy = screen.getByText('Scaled copy')
    const expectedVariant = insetPanelTextVariantBySize[size]
    expect(copy).toHaveClass(textVariants({ variant: expectedVariant }))
  })

  it('allows InsetPanel.Text variant override', () => {
    render(
      <InsetPanel size="lg">
        <InsetPanel.Text variant="caption">Override copy</InsetPanel.Text>
      </InsetPanel>,
    )

    expect(screen.getByText('Override copy')).toHaveClass(textVariants({ variant: 'caption' }))
  })

  it('throws when InsetPanel.Text is used outside InsetPanel', () => {
    expect(() => render(<InsetPanel.Text>Orphan copy</InsetPanel.Text>)).toThrow(
      'InsetPanel.Text must be used within <InsetPanel>',
    )
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <InsetPanel borderStyle="dashed" surface="sunken" size="lg" align="center">
        <InsetPanel.Text>Accessible gate copy</InsetPanel.Text>
      </InsetPanel>,
    )
    await expectNoAxeViolations(container)
  })
})
