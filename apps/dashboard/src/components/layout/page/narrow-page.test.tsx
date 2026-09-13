import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { Heading } from '@rpg/ui'

import { pageShellInsetClasses } from './page-spacing.variants'
import { NarrowPage } from './narrow-page'

describe('NarrowPage', () => {
  it('renders children', () => {
    render(
      <NarrowPage>
        <Heading variant="page" as="h1">
          Profile
        </Heading>
      </NarrowPage>,
    )
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument()
  })

  it('applies spacing without overflow classes', () => {
    const { container } = render(
      <NarrowPage spacing="none">
        <p>Form body</p>
      </NarrowPage>,
    )

    const root = container.firstElementChild
    expect(root).not.toHaveClass(...pageShellInsetClasses.page.split(/\s+/))
    expect(root).not.toHaveClass('overflow-y-auto', 'overflow-hidden')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <NarrowPage rhythm="relaxed">
        <Heading variant="page" as="h1">
          New campaign
        </Heading>
      </NarrowPage>,
    )
    await expectNoAxeViolations(container)
  })
})
