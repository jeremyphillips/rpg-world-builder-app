import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { DividedStack } from './divided-stack'
import { dividedStackVariants } from './divided-stack.variants'

describe('DividedStack', () => {
  it('renders data-slot on the root and maps density to variant classes', () => {
    const { container } = render(
      <DividedStack density="compact">
        <div>First</div>
        <div>Second</div>
      </DividedStack>,
    )

    const root = container.querySelector('[data-slot="divided-stack"]')
    expect(root).toBe(container.firstChild)
    expect(root).toHaveClass(dividedStackVariants({ density: 'compact' }))
  })

  it('renders zero, one, or many direct children without extra wrappers', () => {
    const { rerender } = render(<DividedStack />)
    expect(screen.queryByText('Row')).not.toBeInTheDocument()

    rerender(
      <DividedStack>
        <div>Row</div>
      </DividedStack>,
    )
    expect(screen.getByText('Row')).toBeInTheDocument()

    rerender(
      <DividedStack>
        <div>One</div>
        <div>Two</div>
        <div>Three</div>
      </DividedStack>,
    )
    expect(screen.getByText('One')).toBeInTheDocument()
    expect(screen.getByText('Two')).toBeInTheDocument()
    expect(screen.getByText('Three')).toBeInTheDocument()
  })
})
