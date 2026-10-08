import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { FilterPopover } from './filter-popover.client'
import { LayerPortalContainerProvider } from './layer-portal-container.client'

beforeAll(() => {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => undefined
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => undefined
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => undefined
  }
})

describe('FilterPopover', () => {
  it('portals into the dialog layer and toggles a checkbox once', async () => {
    const user = userEvent.setup()
    const onSelectedValuesChange = vi.fn()
    const layerContainer = document.createElement('div')
    document.body.appendChild(layerContainer)

    render(
      <LayerPortalContainerProvider container={layerContainer}>
        <FilterPopover
          triggerLabel="Casting & mechanics"
          triggerAriaLabel="Casting and mechanics filters"
          groups={[
            {
              id: 'traits',
              label: 'Traits',
              options: [{ value: 'ritual', label: 'Ritual' }],
              selectedValues: [],
              onSelectedValuesChange,
            },
          ]}
        />
      </LayerPortalContainerProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Casting and mechanics filters' }))

    const checkbox = screen.getByRole('checkbox', { name: 'Ritual' })
    expect(layerContainer).toContainElement(checkbox)

    await user.click(checkbox)
    expect(onSelectedValuesChange).toHaveBeenCalledTimes(1)
    expect(onSelectedValuesChange).toHaveBeenCalledWith(['ritual'])
  })
})
