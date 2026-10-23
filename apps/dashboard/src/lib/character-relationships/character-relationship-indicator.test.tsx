import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { renderWithProviders } from '@/test/render'

import { CharacterRelationshipIndicator } from './character-relationship-indicator'

describe('CharacterRelationshipIndicator', () => {
  it('renders nothing when envelope is absent', () => {
    const { container } = renderWithProviders(<CharacterRelationshipIndicator />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders icon with relationship tooltip', () => {
    renderWithProviders(
      <CharacterRelationshipIndicator
        viewerCharacterRelationships={{
          count: 1,
          groups: [
            {
              kind: 'class',
              count: 1,
              relationships: [{ kind: 'class', characterId: '1', characterName: 'Aric' }],
            },
          ],
        }}
      />,
    )

    expect(screen.getByRole('img', { name: 'Class of Aric' })).toBeInTheDocument()
  })

  it('inlinePassive hides icon from accessibility tree', () => {
    renderWithProviders(
      <CharacterRelationshipIndicator
        presentation="inlinePassive"
        viewerCharacterRelationships={{
          count: 1,
          groups: [
            {
              kind: 'class',
              count: 1,
              relationships: [{ kind: 'class', characterId: '1', characterName: 'Aric' }],
            },
          ],
        }}
      />,
    )

    expect(screen.queryByRole('img', { name: 'Class of Aric' })).not.toBeInTheDocument()
    expect(
      document.querySelector('span[aria-hidden="true"] [data-icon="user-round-check"]'),
    ).toBeTruthy()
  })

  itAxe('has no axe violations', async () => {
    const { container } = renderWithProviders(
      <div className="group">
        <CharacterRelationshipIndicator
          viewerCharacterRelationships={{
            count: 1,
            groups: [
              {
                kind: 'class',
                count: 1,
                relationships: [{ kind: 'class', characterId: '1', characterName: 'Aric' }],
              },
            ],
          }}
        />
      </div>,
    )

    await expectNoAxeViolations(container)
  })
})
