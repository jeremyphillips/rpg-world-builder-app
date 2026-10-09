import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { PICKER_DISCLOSURE_DESCRIPTION_SIZE } from '../../lib/detail/metadata/picker-disclosure-description'
import { pickEquipment } from '../../lib/fixtures/pick'
import { buildEquipmentDetailViewModel, EQUIPMENT_STAT_LABELS } from '../lib/equipment-display'
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

    expect(screen.getByText(/^Category/).closest('dl')).toHaveClass('text-sm')
  })

  it('renders picker disclosure descriptions at 14px and keeps detail pages at prose-md', () => {
    const viewModel = { ...longswordDetail, description: '<p>A versatile blade.</p>' }
    const { container, rerender } = render(
      <EquipmentDetailMetadata
        viewModel={viewModel}
        descriptionSize={PICKER_DISCLOSURE_DESCRIPTION_SIZE}
      />,
    )

    expect(container.querySelector('.prose')).toHaveClass('prose-sm')

    rerender(<EquipmentDetailMetadata viewModel={viewModel} />)

    expect(container.querySelector('.prose')).toHaveClass('prose-md')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<EquipmentDetailMetadata viewModel={longswordDetail} />)

    await expectNoAxeViolations(container)
  })
})
