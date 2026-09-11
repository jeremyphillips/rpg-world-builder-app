import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { Heading } from '@rpg/ui'

import { pageScrollClasses } from './page-scroll.variants'
import {
  pageShellInsetBottomClasses,
  pageShellInsetClasses,
  pageShellInsetTopClasses,
} from './page-spacing.variants'
import { WidePage } from './wide-page'

describe('WidePage', () => {
  it('renders children', () => {
    render(
      <WidePage rhythm="list">
        <Heading variant="page" as="h1">
          Equipment
        </Heading>
      </WidePage>,
    )
    expect(screen.getByRole('heading', { name: 'Equipment' })).toBeInTheDocument()
  })

  it('applies scroll and spacing independently', () => {
    const { container } = render(
      <WidePage scroll="viewport" spacing="none">
        <p>Form body</p>
      </WidePage>,
    )

    const root = container.firstElementChild
    expect(root).toHaveClass(...pageScrollClasses.viewport.split(/\s+/))
    expect(root).not.toHaveClass(...pageShellInsetClasses.page.split(/\s+/))
  })

  it('supports top-only shell inset for viewport-bound forms', () => {
    const { container } = render(
      <WidePage scroll="viewport" spacing="page-top">
        <p>Form body</p>
      </WidePage>,
    )

    const root = container.firstElementChild
    expect(root).toHaveClass(...pageShellInsetTopClasses.split(/\s+/))
    expect(root).not.toHaveClass(...pageShellInsetBottomClasses.split(/\s+/))
  })

  it('defaults to page scroll with shell inset', () => {
    const { container } = render(
      <WidePage>
        <p>Body</p>
      </WidePage>,
    )

    const root = container.firstElementChild
    expect(root).toHaveClass(...pageScrollClasses.page.split(/\s+/))
    expect(root).toHaveClass(...pageShellInsetClasses.page.split(/\s+/))
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <WidePage>
        <Heading variant="page" as="h1">
          Sessions
        </Heading>
      </WidePage>,
    )
    await expectNoAxeViolations(container)
  })
})
