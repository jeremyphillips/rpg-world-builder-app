import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CatalogPickerMetadataRenderer } from './catalog-picker-metadata-renderer.client'
import { mapEquipmentCompactSummaryToMetadataLines } from './map-equipment-compact-summary-to-metadata-lines'
import { mapSkillProficiencyCompactSummaryToMetadataLines } from './map-skill-proficiency-compact-summary-to-metadata-lines'
import { mapSpellPickerCompactSummaryToMetadataLines } from './map-spell-picker-compact-summary-to-metadata-lines'

describe('catalog-picker-metadata integration', () => {
  it('renders equipment comparison groups through the shared renderer', () => {
    const { container } = render(
      <CatalogPickerMetadataRenderer
        lines={mapEquipmentCompactSummaryToMetadataLines({
          kindLabel: 'Weapon',
          comparisonGroups: ['1d4 Piercing', 'Finesse · Light · Thrown'],
        })}
      />,
    )

    expect(container).toHaveTextContent('1d4 Piercing · Finesse · Light · Thrown')
  })

  it('renders spell casting and classification lines through the shared renderer', () => {
    render(
      <CatalogPickerMetadataRenderer
        lines={mapSpellPickerCompactSummaryToMetadataLines({
          castingSummary: ['Action', 'Self', 'Concentration, up to 10 minutes'],
          classification: {
            levelLabel: '1st level',
            descriptors: ['Divination'],
          },
        })}
      />,
    )

    expect(screen.getByText('1st level')).toBeInTheDocument()
    expect(screen.getByText('Divination')).toBeInTheDocument()
  })

  it('renders skill ability metadata through the shared renderer', () => {
    render(
      <CatalogPickerMetadataRenderer
        lines={mapSkillProficiencyCompactSummaryToMetadataLines({
          abilityLabel: 'Dexterity',
          exampleUses: ['Escape notice by moving quietly and hiding behind things'],
        })}
      />,
    )

    expect(screen.getByText('Dexterity')).toBeInTheDocument()
  })
})
