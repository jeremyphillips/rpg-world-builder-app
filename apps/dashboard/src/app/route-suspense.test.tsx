import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'
import { Text } from '@rpg/ui'

import { RouteSuspense } from './route-suspense'

const axeOptions = { rules: { 'color-contrast': { enabled: false } } }

describe('RouteSuspense', () => {
  it('renders children when the boundary is not suspending', () => {
    render(
      <RouteSuspense>
        <Text>Route content</Text>
      </RouteSuspense>,
    )
    expect(screen.getByText('Route content')).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <RouteSuspense>
        <Text>Route content</Text>
      </RouteSuspense>,
    )
    const results = await axe.run(container, axeOptions)
    expect(results.violations).toEqual([])
  })
})
