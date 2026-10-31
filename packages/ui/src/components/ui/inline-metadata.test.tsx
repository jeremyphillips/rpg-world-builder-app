/**
 * @vitest-environment jsdom
 */
import type { ComponentProps } from 'react'

import { render } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { InlineMetadata } from './inline-metadata'

function renderTwoItems(
  props: Omit<ComponentProps<typeof InlineMetadata>, 'children'>,
  second = 'B',
) {
  return render(
    <InlineMetadata {...props}>
      <InlineMetadata.Item>A</InlineMetadata.Item>
      <InlineMetadata.Item>{second}</InlineMetadata.Item>
    </InlineMetadata>,
  )
}

describe('InlineMetadata', () => {
  it('renders heading compact nowrap with muted-free items', () => {
    const { container } = renderTwoItems({ role: 'heading', density: 'compact', wrap: false })

    expect(container.textContent).toContain('A')
    expect(container.textContent).toContain('·')
    expect(container.textContent).toContain('B')
    expect(container.querySelectorAll('[data-inline-metadata-separator]')).toHaveLength(1)
    expect(container.firstElementChild).toHaveClass('flex', 'min-w-0', 'items-baseline')
    expect(container.querySelector('[data-inline-metadata-separator]')).toHaveClass('mx-1')
    expect(container.querySelectorAll('.text-muted-foreground')).toHaveLength(1)
  })

  it('opts the separator into text-xs without changing default', () => {
    const { container } = renderTwoItems({
      role: 'heading',
      density: 'compact',
      wrap: false,
      separatorSize: 'xs',
    })

    expect(container.querySelector('[data-inline-metadata-separator]')).toHaveClass('text-xs')
  })

  it('renders heading comfortable nowrap separator spacing', () => {
    const { container } = renderTwoItems({
      role: 'heading',
      density: 'comfortable',
      wrap: false,
    })

    expect(container.querySelector('[data-inline-metadata-separator]')).toHaveClass('mx-1.5')
  })

  it('renders supporting compact with muted items', () => {
    const { container } = renderTwoItems({ role: 'supporting', density: 'compact', wrap: false })

    const items = container.querySelectorAll(':scope > span > span')
    expect(items.length).toBeGreaterThanOrEqual(2)
    expect(container.querySelectorAll('.text-muted-foreground').length).toBeGreaterThanOrEqual(2)
  })

  it('defaults supporting to wrap and heading to nowrap', () => {
    const { container: supporting } = renderTwoItems({ role: 'supporting', density: 'compact' })
    expect(supporting.firstElementChild).not.toHaveClass('flex')

    const { container: heading } = renderTwoItems({ role: 'heading', density: 'compact' })
    expect(heading.firstElementChild).toHaveClass('flex')
  })

  it('places separators only between items', () => {
    const { container } = render(
      <InlineMetadata role="heading" density="compact" wrap={false}>
        <InlineMetadata.Item>One</InlineMetadata.Item>
        <InlineMetadata.Item>Two</InlineMetadata.Item>
        <InlineMetadata.Item>Three</InlineMetadata.Item>
      </InlineMetadata>,
    )

    expect(container.querySelectorAll('[data-inline-metadata-separator]')).toHaveLength(2)
    expect(container.textContent).toContain('One')
    expect(container.textContent).toContain('Two')
    expect(container.textContent).toContain('Three')
  })

  it('drops conditional items and their separators', () => {
    const { container } = render(
      <InlineMetadata role="supporting" density="compact" wrap={false}>
        <InlineMetadata.Item>Weapon</InlineMetadata.Item>
        {false}
        {null}
        {undefined}
        <InlineMetadata.Item>1d6</InlineMetadata.Item>
      </InlineMetadata>,
    )

    expect(container.querySelectorAll('[data-inline-metadata-separator]')).toHaveLength(1)
    expect(container.textContent).toContain('Weapon')
    expect(container.textContent).toContain('1d6')
  })

  it('marks separators aria-hidden', () => {
    const { container } = renderTwoItems({ role: 'heading', density: 'compact', wrap: false })

    const separator = container.querySelector('[data-inline-metadata-separator]')
    expect(separator).toHaveAttribute('aria-hidden', 'true')
  })

  it('nowrap separator uses horizontal margin only', () => {
    const { container } = renderTwoItems(
      {
        role: 'heading',
        density: 'comfortable',
        wrap: false,
      },
      '(1d8+3)',
    )

    const separator = container.querySelector('[data-inline-metadata-separator]')
    expect(separator).toHaveClass('mx-1.5')
    expect(separator?.textContent).toBe('·')

    const secondItem = container.querySelectorAll(':scope > span > span')[1]
    expect(secondItem?.firstElementChild).toBe(separator)
    expect(secondItem?.lastChild?.textContent).toBe('(1d8+3)')
  })

  it('nowrap compact and comfortable use distinct margin steps only', () => {
    const { container: compact } = renderTwoItems({
      role: 'heading',
      density: 'compact',
      wrap: false,
    })
    const { container: comfortable } = renderTwoItems({
      role: 'heading',
      density: 'comfortable',
      wrap: false,
    })

    expect(compact.querySelector('[data-inline-metadata-separator]')).toHaveClass('mx-1')
    expect(comfortable.querySelector('[data-inline-metadata-separator]')).toHaveClass('mx-1.5')
  })

  it('uses wrapping separator markup with nbsp glue', () => {
    const { container } = renderTwoItems({ role: 'supporting', density: 'compact', wrap: true })

    const separator = container.querySelector('[data-inline-metadata-separator]')
    expect(separator?.textContent).toBe('\u00A0· ')
    expect(container.firstElementChild).not.toHaveClass('flex')
    expect(container).toHaveTextContent('A · B')
  })

  it('wrap separator uses nbsp glue without horizontal margin', () => {
    const { container } = renderTwoItems({
      role: 'supporting',
      density: 'comfortable',
      wrap: true,
    })

    const separator = container.querySelector('[data-inline-metadata-separator]')
    expect(separator?.textContent).toBe('\u00A0· ')
    expect(separator?.className).not.toMatch(/\bmx-/)
  })

  it('wrap compact matches string copy spacing without margin', () => {
    const { container } = renderTwoItems({
      role: 'supporting',
      density: 'compact',
      wrap: true,
    })

    const separator = container.querySelector('[data-inline-metadata-separator]')
    expect(separator?.textContent).toBe('\u00A0· ')
    expect(separator?.className).not.toMatch(/\bmx-/)
  })

  it('applies truncate only on nowrap items', () => {
    const { container } = render(
      <InlineMetadata role="heading" density="compact" wrap={false}>
        <InlineMetadata.Item truncate>Long title</InlineMetadata.Item>
        <InlineMetadata.Item>Fixed</InlineMetadata.Item>
      </InlineMetadata>,
    )

    const root = container.firstElementChild!
    const itemSpans = [...root.children]
    expect(itemSpans[0]).toHaveClass('truncate', 'min-w-0', 'shrink')
    expect(itemSpans[1]).toHaveClass('shrink-0')
    expect(itemSpans[1]).not.toHaveClass('truncate')
  })

  it('does not set font-size classes on role variants', () => {
    const { container } = renderTwoItems({ role: 'heading', density: 'compact', wrap: false })
    const root = container.firstElementChild
    const className = root?.className ?? ''

    expect(className).not.toMatch(/\btext-(xs|sm|base|lg|xl)\b/)
    expect(root?.querySelector('.text-sm')).toBeNull()
  })

  it('merges positioning className on the root', () => {
    const { container } = render(
      <InlineMetadata role="heading" density="compact" wrap={false} className="min-w-0 flex-1">
        <InlineMetadata.Item>A</InlineMetadata.Item>
      </InlineMetadata>,
    )

    expect(container.firstElementChild).toHaveClass('min-w-0', 'flex-1')
  })

  it('merges item className for emphasis', () => {
    const { container } = render(
      <InlineMetadata role="heading" density="compact" wrap={false}>
        <InlineMetadata.Item className="font-medium">A</InlineMetadata.Item>
        <InlineMetadata.Item>B</InlineMetadata.Item>
      </InlineMetadata>,
    )

    const firstItem = container.querySelector('.font-medium')
    expect(firstItem).toHaveTextContent('A')
  })

  it('logs in development when a child is not InlineMetadata.Item', () => {
    vi.stubEnv('NODE_ENV', 'development')
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(
      <InlineMetadata role="heading" density="compact" wrap={false}>
        <span>bad</span>
        <InlineMetadata.Item>A</InlineMetadata.Item>
      </InlineMetadata>,
    )

    expect(error).toHaveBeenCalled()
    error.mockRestore()
    vi.unstubAllEnvs()
  })

  it('rejects bare string children at compile time', () => {
    expect(
      // @ts-expect-error InlineMetadata only accepts Item elements
      <InlineMetadata role="heading" density="compact">
        A · B
      </InlineMetadata>,
    ).toBeTruthy()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderTwoItems({ role: 'supporting', density: 'compact', wrap: true })

    await expectNoAxeViolations(container)
  })
})
