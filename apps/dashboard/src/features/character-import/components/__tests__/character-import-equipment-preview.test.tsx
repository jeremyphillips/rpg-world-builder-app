import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { CharacterImportEquipmentPreviewSection } from '../character-import-equipment-preview'

describe('CharacterImportEquipmentPreviewSection', () => {
  it('groups supported equipment above unsupported items', () => {
    render(
      <CharacterImportEquipmentPreviewSection
        result={{
          status: 'mapped',
          value: [
            {
              sourceValue: 'Backpack',
              sourceLabel: 'Backpack',
              quantity: 2,
              status: 'mapped',
              localValue: 'srd-cc-5.2.1:backpack',
            },
            {
              sourceValue: "Assassin's Blood (Ingested)",
              sourceLabel: "Assassin's Blood (Ingested)",
              quantity: 1,
              status: 'unresolved-reference',
            },
          ],
          sourcePaths: ['data.inventory'],
          issues: [],
        }}
      />,
    )

    expect(screen.getByText('2x Backpack')).toBeInTheDocument()
    expect(screen.getByText('Unsupported:')).toBeInTheDocument()
    expect(screen.getByText("Assassin's Blood (Ingested)")).toBeInTheDocument()
  })
})
