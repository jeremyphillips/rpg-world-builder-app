import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { Button } from './button.client'
import { NumberStepper } from './number-stepper.client'
import {
  SelectionOptionCardEmbeddedPanel,
  SelectionOptionCardEmbeddedPanelHeader,
  SelectionOptionCardEmbeddedPanelList,
  SelectionOptionCardEmbeddedPanelRow,
  SelectionOptionCardEmbeddedPanelRowStatus,
} from './selection-option-card-embedded-panel.client'

describe('SelectionOptionCardEmbeddedPanel', () => {
  it('renders compact header, bordered rows, and row status typography', () => {
    const { container } = render(
      <SelectionOptionCardEmbeddedPanel>
        <SelectionOptionCardEmbeddedPanelHeader
          title="Customize Heavy Armor"
          description="Adjust what this NPC keeps from the selected package."
        />
        <SelectionOptionCardEmbeddedPanelList>
          <SelectionOptionCardEmbeddedPanelRow label="Javelin">
            <NumberStepper
              size="xs"
              aria-label="Quantity of Javelin kept from Heavy Armor"
              min={0}
              max={8}
              value={6}
              onChange={() => undefined}
            />
            <Button type="button" variant="text" size="xs" density="compact">
              Remove
            </Button>
          </SelectionOptionCardEmbeddedPanelRow>
          <SelectionOptionCardEmbeddedPanelRow label="Flail">
            <SelectionOptionCardEmbeddedPanelRowStatus>
              Removed
            </SelectionOptionCardEmbeddedPanelRowStatus>
            <Button type="button" variant="text" size="xs" density="compact">
              Restore
            </Button>
          </SelectionOptionCardEmbeddedPanelRow>
        </SelectionOptionCardEmbeddedPanelList>
      </SelectionOptionCardEmbeddedPanel>,
    )

    expect(container.firstElementChild).toHaveClass('p-3')
    expect(screen.getByRole('heading', { name: 'Customize Heavy Armor' })).toHaveClass('text-sm')
    expect(screen.getByText('Adjust what this NPC keeps from the selected package.')).toHaveClass(
      'text-xs',
    )
    expect(screen.getByText('Removed')).toHaveClass('text-control-action-xs')
  })
})
