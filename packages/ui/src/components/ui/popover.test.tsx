import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Button } from './button.client'
import { Popover, PopoverContent, PopoverTrigger } from './popover.client'
import { overlayArrowHeight, overlayArrowPath, overlayArrowWidth } from './popover-content.variants'

describe('Popover', () => {
  it('opens content from the trigger', async () => {
    const user = userEvent.setup()
    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button">Open</Button>
        </PopoverTrigger>
        <PopoverContent>Score menu</PopoverContent>
      </Popover>,
    )

    await user.click(screen.getByRole('button', { name: 'Open' }))
    expect(screen.getByText('Score menu')).toBeInTheDocument()
    expect(document.body.querySelector('.ui-overlay-arrow')).toBeNull()
  })

  it('renders an arrow when requested', async () => {
    const user = userEvent.setup()
    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button">Open</Button>
        </PopoverTrigger>
        <PopoverContent arrow>Score menu</PopoverContent>
      </Popover>,
    )

    await user.click(screen.getByRole('button', { name: 'Open' }))
    const arrows = document.body.querySelectorAll('.ui-overlay-arrow')
    expect(arrows).toHaveLength(1)
    const arrow = arrows[0]
    expect(arrow).toHaveAttribute('viewBox', `0 0 ${overlayArrowWidth} ${overlayArrowHeight}`)
    expect(arrow?.querySelector('path')).toHaveAttribute('d', overlayArrowPath)
  })
})
