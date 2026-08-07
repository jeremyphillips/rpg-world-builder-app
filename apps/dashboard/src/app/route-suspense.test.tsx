import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { Text } from '@rpg/ui'

import { RouteSuspense } from './route-suspense'

describe('RouteSuspense', () => {
  it('renders children when the boundary is not suspending', () => {
    render(
      <RouteSuspense>
        <Text>Route content</Text>
      </RouteSuspense>,
    )
    expect(screen.getByText('Route content')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <RouteSuspense>
        <Text>Route content</Text>
      </RouteSuspense>,
    )
    await expectNoAxeViolations(container)
  })
})
