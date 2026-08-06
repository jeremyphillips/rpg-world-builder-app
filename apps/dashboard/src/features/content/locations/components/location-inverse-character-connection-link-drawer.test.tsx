import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { YAWNING_PORTAL } from '../fixtures'
import { LocationInverseCharacterConnectionLinkDrawer } from './location-inverse-character-connection-link-drawer.client'

const characters = [
  {
    id: 'npc-1',
    name: 'Braggi',
    summary: 'Merchant',
    characterType: 'npc' as const,
  },
]

describe('LocationInverseCharacterConnectionLinkDrawer', () => {
  it('opens change-kind with expanded relationship type and no character picker', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()

    render(
      <LocationInverseCharacterConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="changeKind"
        location={YAWNING_PORTAL}
        characters={characters}
        connectedPartyRows={[
          {
            relationshipId: 'rel-1',
            subject: {
              type: 'character',
              id: 'npc-1',
              name: 'Braggi',
              slug: 'npc-1',
              characterType: 'npc',
            },
            kind: 'works_at',
            label: 'Works at',
            family: 'presence',
            priority: 40,
            sectionGroup: 'people_and_organizations',
          },
        ]}
        initialConnection={{
          relationshipId: 'rel-1',
          characterId: 'npc-1',
          kind: 'works_at',
        }}
        onSubmit={onSubmit}
      />,
    )

    expect(screen.getByRole('dialog', { name: 'Change connection type' })).toBeInTheDocument()
    expect(screen.getByText('Character')).toBeInTheDocument()
    expect(screen.getByText('Braggi')).toBeInTheDocument()
    expect(screen.queryByText(/Current:/i)).not.toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Connection type' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Works at/i })).toBeChecked()
    expect(screen.queryByPlaceholderText('Search characters')).not.toBeInTheDocument()
    expect(screen.queryByText('No characters are available.')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save change' })).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /Resident/i }))
    await user.click(screen.getByRole('button', { name: 'Save change' }))

    expect(onSubmit).toHaveBeenCalledWith({
      characterId: 'npc-1',
      kind: 'resides_at',
    })
  })
})
