import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { Heading } from '@rpg/ui'

import { WidePage } from './wide-page'

describe('WidePage', () => {
  it('renders children', () => {
    render(
      <WidePage spacing="list">
        <Heading variant="page" as="h1">
          Equipment
        </Heading>
      </WidePage>,
    )
    expect(screen.getByRole('heading', { name: 'Equipment' })).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
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
