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

    expect(screen.getByText('Magic items')).toBeInTheDocument()
    expect(screen.getByText('Common, complete')).toBeInTheDocument()
    expect(screen.getByText('Common, complete').querySelector('svg')).toBeInTheDocument()
  })

  it('omits the trailing action in compact currency summaries', () => {
    render(
      <EquipmentResourceSummary
        density="compact"
        currency={{
          heading: '40 GP remaining',
          metadata: ['100 GP budget', '15 GP spent'],
        }}
      />,
    )

    expect(screen.getByText('40 GP remaining')).toBeInTheDocument()
    expect(screen.getByText('100 GP budget')).toBeInTheDocument()
    expect(screen.getByText('15 GP spent')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('uses a single panel shell with embedded anatomy hosts', () => {
    const { container } = render(
      <EquipmentResourceSummary
        density="comfortable"
        currency={{
          heading: '15 GP remaining',
          metadata: ['15 GP budget', '0 GP spent'],
        }}
        slots={[openCommon]}
      />,
    )

    expect(container.querySelectorAll('.ui-card')).toHaveLength(0)
    expect(container.firstElementChild).toHaveClass(
      'ui-panel',
      'ui-panel--transparent',
      'ui-panel--comfortable',
    )
    expect(container.firstElementChild).not.toHaveClass('overflow-hidden')
  })

  it('gives each resource section its own action inside a divided stack', () => {
    const { container } = render(
      <EquipmentResourceSummary
        density="comfortable"
        currency={{
          heading: '15 GP remaining',
          metadata: ['15 GP budget', '0 GP spent'],
        }}
        slots={[openCommon]}
        currencyAction={{
          label: 'Browse equipment',
          variant: 'secondary',
          onClick: () => undefined,
        }}
        magicItemsAction={{
          label: 'Browse magic items',
          variant: 'secondary',
          onClick: () => undefined,
        }}
      />,
    )

    expect(screen.getByRole('button', { name: 'Browse equipment' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Browse magic items' })).toBeInTheDocument()
    expect(container.querySelector('[data-slot="divided-stack"]')).toBeInTheDocument()
  })

  it('shows one badge per rarity slot passed in', () => {
    render(<EquipmentResourceSummary density="comfortable" slots={[openCommon]} />)
    expect(screen.getByText('Common · 2 remaining')).toBeInTheDocument()
    expect(screen.getAllByText(/Common/)).toHaveLength(1)
  })
})
