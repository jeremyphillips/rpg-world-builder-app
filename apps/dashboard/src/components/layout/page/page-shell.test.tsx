import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { Heading } from '@rpg/ui'

import { pageShellInsetClasses } from './page-spacing.variants'
import {
  pageShellFullWidthClasses,
  pageShellNarrowWidthClasses,
  pageShellWideWidthClasses,
} from './page-shell.variants'
import { PageShell } from './page-shell'

describe('PageShell', () => {
  it.each([
    ['full', pageShellFullWidthClasses],
    ['wide', pageShellWideWidthClasses],
    ['narrow', pageShellNarrowWidthClasses],
  ] as const)('applies %s width classes', (width, expected) => {
    const { container } = render(
      <PageShell width={width} spacing="none">
        <p>Body</p>
      </PageShell>,
    )
    const root = container.firstElementChild
    for (const token of expected.split(/\s+/)) {
      expect(root).toHaveClass(token)
    }
  })

  it('renders children', () => {
    render(
      <PageShell width="narrow">
        <Heading variant="page" as="h1">
          Profile
        </Heading>
      </PageShell>,
    )
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument()
  })

  it('applies spacing without overflow classes', () => {
    const { container } = render(
      <PageShell width="full" spacing="none">
        <p>Form body</p>
      </PageShell>,
    )

    const root = container.firstElementChild
    expect(root).not.toHaveClass(...pageShellInsetClasses.page.split(/\s+/))
    expect(root).not.toHaveClass('overflow-y-auto', 'overflow-hidden')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <PageShell width="narrow" rhythm="relaxed">
        <Heading variant="page" as="h1">
          New campaign
        </Heading>
      </PageShell>,
    )
    await expectNoAxeViolations(container)
  })
})
