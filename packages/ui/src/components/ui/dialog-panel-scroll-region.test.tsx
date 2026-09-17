import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { DialogPanelScrollRegion } from './dialog-panel-scroll-region.client'
import {
  dialogPanelScrollRegionBottomInsetClasses,
  dialogPanelScrollRegionFocusClearanceClasses,
  dialogPanelScrollRegionTopInsetClasses,
  dialogPanelSectionInsetXClasses,
} from './dialog-panel.variants'
import { boundedScrollRegionEndInsetClasses } from './bounded-scroll-region.variants'

describe('DialogPanelScrollRegion', () => {
  it('renders a section scroll viewport with explicit overlay inset axes', () => {
    render(
      <DialogPanelScrollRegion data-testid="overlay-scroll-viewport">
        <p>Scroll item</p>
      </DialogPanelScrollRegion>,
    )

    const viewport = screen.getByTestId('overlay-scroll-viewport')
    expect(viewport).toHaveClass('overflow-y-auto')
    expect(viewport).toHaveClass(dialogPanelSectionInsetXClasses)
    expect(viewport).toHaveClass(dialogPanelScrollRegionTopInsetClasses)
    expect(viewport).toHaveClass(dialogPanelScrollRegionBottomInsetClasses)
    expect(viewport).not.toHaveClass('p-6')
    expect(viewport).not.toHaveClass(dialogPanelScrollRegionFocusClearanceClasses)
    expect(viewport).toHaveClass('pe-6')
    expect(viewport).not.toHaveClass('pe-2.5')
  })

  it('renders inner scroll chrome without section horizontal inset or top inset', () => {
    render(
      <DialogPanelScrollRegion inset="inner" data-testid="inner-scroll-viewport">
        <p>Scroll item</p>
      </DialogPanelScrollRegion>,
    )

    const viewport = screen.getByTestId('inner-scroll-viewport')
    expect(viewport).toHaveClass(dialogPanelScrollRegionFocusClearanceClasses)
    expect(viewport).toHaveClass(boundedScrollRegionEndInsetClasses)
    expect(viewport).not.toHaveClass(dialogPanelSectionInsetXClasses)
    expect(viewport).not.toHaveClass(dialogPanelScrollRegionTopInsetClasses)
  })

  it('renders leading inner scrollport with top inset below the header border', () => {
    render(
      <DialogPanelScrollRegion inset="innerLeading" data-testid="leading-inner-scroll-viewport">
        <p>Scroll item</p>
      </DialogPanelScrollRegion>,
    )

    const viewport = screen.getByTestId('leading-inner-scroll-viewport')
    expect(viewport).toHaveClass(dialogPanelScrollRegionTopInsetClasses)
    expect(viewport).toHaveClass(dialogPanelScrollRegionFocusClearanceClasses)
    expect(viewport).not.toHaveClass(dialogPanelSectionInsetXClasses)
  })

  it('keeps boundary fades pointer-events-none', () => {
    render(
      <DialogPanelScrollRegion data-testid="overlay-scroll-viewport">
        <button type="button">Top action</button>
      </DialogPanelScrollRegion>,
    )

    const fades = document.querySelectorAll(
      '.pointer-events-none.bg-gradient-to-b, .pointer-events-none.bg-gradient-to-t',
    )
    expect(fades.length).toBeGreaterThanOrEqual(2)
    fades.forEach((fade) => {
      expect(fade).toHaveClass('pointer-events-none')
    })
  })

  it('does not block clicks on viewport controls', async () => {
    const user = userEvent.setup()
    let clicked = false

    render(
      <DialogPanelScrollRegion data-testid="overlay-scroll-viewport">
        <button
          type="button"
          onClick={() => {
            clicked = true
          }}
        >
          Top action
        </button>
      </DialogPanelScrollRegion>,
    )

    await user.click(screen.getByRole('button', { name: 'Top action' }))
    expect(clicked).toBe(true)
  })
})
