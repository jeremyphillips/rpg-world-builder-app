import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'
import { Heading } from '@rpg/ui'

import { NarrowPage } from './narrow-page'

const axeOptions = { rules: { 'color-contrast': { enabled: false } } }

describe('NarrowPage', () => {
  it('renders children', () => {
    render(
      <NarrowPage>
        <Heading variant="page" as="h2">
          Profile
        </Heading>
      </NarrowPage>,
    )
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <NarrowPage spacing="relaxed">
        <Heading variant="page" as="h2">
          New campaign
        </Heading>
      </NarrowPage>,
    )
    const results = await axe.run(container, axeOptions)
    expect(results.violations).toEqual([])
  })
})
