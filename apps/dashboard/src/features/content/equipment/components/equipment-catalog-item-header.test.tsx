import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { EquipmentCatalogItemHeader } from './equipment-catalog-item-header.client'

describe('EquipmentCatalogItemHeader', () => {
  it('renders name, metadata, footer, and actions without character imports', () => {
    render(
      <EquipmentCatalogItemHeader
        name="Dagger"
        metadataLines={[{ segments: [{ type: 'text', text: '1d4 Piercing' }] }]}
        footer={<span>Weapon</span>}
        actions={<button type="button">Add</button>}
      />,
    )

    expect(screen.getByText('Dagger')).toBeInTheDocument()
    expect(screen.getByText('1d4 Piercing')).toBeInTheDocument()
    expect(screen.getByText('Weapon')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <EquipmentCatalogItemHeader
        name="Dagger"
        metadataLines={[{ segments: [{ type: 'text', text: '1d4 Piercing' }] }]}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
