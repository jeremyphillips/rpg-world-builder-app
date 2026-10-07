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
    expect(badge.querySelector('.rounded-full')).toHaveClass(
      'bg-status-icon-idle',
      'text-status-icon-neutral-foreground',
    )
    expect(badge).not.toHaveTextContent('·')
    expect(screen.getByRole('heading', { name: 'Magic items' })).toHaveClass('heading-style-group')
  })

  it('omits the trailing action in compact currency summaries', () => {
    render(
      <EquipmentResourceSummary
        density="compact"
        currency={{ heading: '40 GP remaining', subheading: '100 GP budget · 15 GP spent' }}
      />,
    )

    expect(screen.getByRole('heading', { name: '40 GP remaining' })).toHaveClass(
      'heading-style-group',
    )
    expect(screen.getByText('100 GP budget · 15 GP spent')).toHaveClass('text-sm')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('gives each resource section its own action and space between them', () => {
    const { container } = render(
      <EquipmentResourceSummary
        density="comfortable"
        currency={{ heading: '15 GP remaining', subheading: '15 GP budget · 0 GP spent' }}
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

    const browseEquipment = screen.getByRole('button', { name: 'Browse equipment' })
    expect(browseEquipment).toHaveClass('bg-action-secondary')
    expect(browseEquipment.parentElement).toHaveClass('shrink-0', 'self-center')
    expect(screen.getByRole('button', { name: 'Browse magic items' })).toHaveClass(
      'bg-action-secondary',
    )
    expect(container.querySelector('.border-t')).toHaveClass('mt-4', 'pt-4', 'border-border')
  })

  it('shows one aggregated badge for duplicate rarity slots passed in', () => {
    render(<EquipmentResourceSummary density="comfortable" slots={[openCommon]} />)
    const badge = screen.getByLabelText('Common · 2 remaining')
    expect(badge).toHaveTextContent('Common · 2 remaining')
    expect(badge.querySelector('[data-inline-metadata-separator]')).toBeNull()
    expect(screen.getAllByLabelText(/Common/)).toHaveLength(1)
  })
})
