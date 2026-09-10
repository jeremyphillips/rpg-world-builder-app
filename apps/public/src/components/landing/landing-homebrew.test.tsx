import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { HOMEBREW_SHOWCASE_ITEMS } from './landing-content'
import { LandingHomebrew } from './landing-homebrew'

function showcaseItemAt(index: number) {
  const item = HOMEBREW_SHOWCASE_ITEMS[index]
  if (!item) throw new Error(`missing homebrew showcase item at index ${index}`)
  return item
}

describe('LandingHomebrew', () => {
  it('renders a trigger for every homebrew content type', () => {
    render(<LandingHomebrew />)

    for (const item of HOMEBREW_SHOWCASE_ITEMS) {
      expect(screen.getByRole('button', { name: item.title })).toBeInTheDocument()
    }
  })

  it('expands the first item by default', () => {
    render(<LandingHomebrew />)

    const firstItem = showcaseItemAt(0)
    expect(screen.getByRole('button', { name: firstItem.title })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByText(firstItem.description)).toBeVisible()
  })

  it('reveals a description when its trigger is clicked', async () => {
    const user = userEvent.setup()
    render(<LandingHomebrew />)

    const secondItem = showcaseItemAt(1)
    await user.click(screen.getByRole('button', { name: secondItem.title }))

    expect(screen.getByRole('button', { name: secondItem.title })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByText(secondItem.description)).toBeVisible()
  })
})
