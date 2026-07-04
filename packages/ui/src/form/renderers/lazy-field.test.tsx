import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { Text } from '../../components/ui/text'

import { LazyFieldSuspense } from './lazy-field.client'

describe('LazyFieldSuspense', () => {
  it('renders children when the boundary is not suspending', () => {
    render(
      <LazyFieldSuspense>
        <Text>Field content</Text>
      </LazyFieldSuspense>,
    )
    expect(screen.getByText('Field content')).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <LazyFieldSuspense>
        <Text>Field content</Text>
      </LazyFieldSuspense>,
    )
    await expectNoAxeViolations(container)
  })
})
