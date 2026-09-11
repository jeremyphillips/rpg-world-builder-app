import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { Heading } from '@rpg/ui'

import { pageScrollClasses } from './page-scroll.variants'
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

  it('viewport scroll with none spacing does not apply py-8', () => {
    const { container } = render(
      <NarrowPage scroll="viewport" spacing="none">
        <p>Form body</p>
      </NarrowPage>,
    )

    const root = container.firstElementChild
    expect(root).toHaveClass(...pageScrollClasses.viewport.split(/\s+/))
    expect(root).not.toHaveClass(...pageShellInsetClasses.page.split(/\s+/))
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
