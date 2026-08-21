import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { Heading } from '@rpg/ui'

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

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <NarrowPage spacing="relaxed">
        <Heading variant="page" as="h1">
          New campaign
        </Heading>
      </NarrowPage>,
    )
    await expectNoAxeViolations(container)
  })
})
