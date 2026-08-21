import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { buildEquipmentDetailViewModel, EQUIPMENT_STAT_LABELS } from '../lib/equipment-display'
import { pickEquipment } from '../../lib/fixtures/pick'
import { EquipmentDetailMetadata } from './equipment-detail-metadata'

const longswordDetail = buildEquipmentDetailViewModel(pickEquipment('longsword'))

describe('EquipmentDetailMetadata', () => {
  it('renders the kind-specific section title and stat rows', () => {
    render(<EquipmentDetailMetadata viewModel={longswordDetail} />)

    expect(screen.getByRole('heading', { name: 'Weapon details' })).toBeInTheDocument()
    expect(screen.getByText(/Kind/)).toBeInTheDocument()
    expect(screen.getByText(/Cost/)).toBeInTheDocument()
  })

  it('filters omitted stat labels for picker surfaces', () => {
    render(
      <EquipmentDetailMetadata
        viewModel={longswordDetail}
        omitStatLabels={[EQUIPMENT_STAT_LABELS.kind, EQUIPMENT_STAT_LABELS.cost]}
      />,
    )

    expect(screen.queryByText(/^Kind/)).not.toBeInTheDocument()
    expect(screen.queryByText(/^Cost/)).not.toBeInTheDocument()
    expect(screen.getByText(/Category/)).toBeInTheDocument()
  })

  it('omits the section title for picker surfaces', () => {
    render(<EquipmentDetailMetadata viewModel={longswordDetail} omitSectionTitle />)

    expect(screen.queryByRole('heading', { name: 'Weapon details' })).not.toBeInTheDocument()
    expect(screen.getByText(/Category/)).toBeInTheDocument()
  })

  it('uses compact stat row typography for picker collapsible bodies', () => {
    render(
      <EquipmentDetailMetadata viewModel={longswordDetail} omitSectionTitle statRowSize="sm" />,
    )

    expect(screen.getByText(/^Category/)).toHaveClass('text-sm')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<EquipmentDetailMetadata viewModel={longswordDetail} />)

    await expectNoAxeViolations(container)
  })
})
