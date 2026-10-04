import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import type { EquipmentMagicItemSlot } from '@rpg/contracts'

import { EquipmentResourceSummary } from './equipment-resource-summary'

const openCommon: EquipmentMagicItemSlot = {
  rarity: 'common',
  rarityMode: 'exact',
  quantity: 2,
  remaining: 2,
  fulfilled: false,
}

const fulfilledCommon: EquipmentMagicItemSlot = {
  rarity: 'common',
  rarityMode: 'exact',
  quantity: 1,
  remaining: 0,
  fulfilled: true,
}

describe('EquipmentResourceSummary', () => {
  it('renders nothing when currency and magic slots are both absent', () => {
    const { container } = render(<EquipmentResourceSummary density="comfortable" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('keeps a magic-items row when every slot is fulfilled', () => {
    render(<EquipmentResourceSummary density="comfortable" slots={[fulfilledCommon]} />)

    expect(screen.getByRole('heading', { name: 'Magic items' })).toBeInTheDocument()
    const badge = screen.getByLabelText('Common, complete')
    expect(badge).toHaveClass('text-muted-foreground', 'bg-semantic-neutral-soft')
    expect(badge.className).not.toContain('text-foreground-disabled')
  })

  it('omits the trailing action in compact currency summaries', () => {
    render(
      <EquipmentResourceSummary
        density="compact"
        currency={{ heading: '40 GP remaining', subheading: '100 GP budget · 15 GP spent' }}
      />,
    )

    expect(screen.getByRole('heading', { name: '40 GP remaining' })).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shows one aggregated badge for duplicate rarity slots passed in', () => {
    render(<EquipmentResourceSummary density="comfortable" slots={[openCommon]} />)
    expect(screen.getByLabelText('Common · 2 remaining')).toBeInTheDocument()
    expect(screen.getAllByLabelText(/Common/)).toHaveLength(1)
  })
})
