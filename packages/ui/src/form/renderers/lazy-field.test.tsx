import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'
import { Text } from '../../components/ui/text'

import { LazyFieldSuspense } from './lazy-field.client'

const axeOptions = { rules: { 'color-contrast': { enabled: false } } }

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
    const results = await axe.run(container, axeOptions)
    expect(results.violations).toEqual([])
  })
})
