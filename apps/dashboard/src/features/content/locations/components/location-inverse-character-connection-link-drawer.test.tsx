import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { LOCATIONS_LIST, YAWNING_PORTAL } from '../fixtures'
import { buildLocationsById } from '../lib/location-display'
import { LocationInverseCharacterConnectionLinkDrawer } from './location-inverse-character-connection-link-drawer.client'

const locationsById = buildLocationsById(LOCATIONS_LIST)

const characters = [
  {
    id: 'npc-1',
    name: 'Braggi',
    summary: 'Merchant',
    characterType: 'npc' as const,
  },
]

const inverseDrawerContextProps = {
  locationsById,
  campaignId: STORY_CAMPAIGN_ID,
}

describe('LocationInverseCharacterConnectionLinkDrawer', () => {
  it('uses inverse character search placeholder when adding with a resolved kind', () => {
    render(
      <LocationInverseCharacterConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        addKind="works_at"
        location={YAWNING_PORTAL}
        {...inverseDrawerContextProps}
        characters={characters}
        connectedPartyRows={[]}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByPlaceholderText('Search characters…')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Search organizations…')).not.toBeInTheDocument()
  })

  it('shows location context in add mode', () => {
    render(
      <LocationInverseCharacterConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="add"
        addKind="works_at"
        location={YAWNING_PORTAL}
        {...inverseDrawerContextProps}
        characters={characters}
        connectedPartyRows={[]}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('Yawning Portal')).toBeInTheDocument()
    expect(screen.getByText('Building · Brewery')).toBeInTheDocument()
    expect(screen.getByText('Located in Dock Ward')).toBeInTheDocument()
  })

  it('opens change-kind with expanded relationship type and no character picker', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()

    render(
      <LocationInverseCharacterConnectionLinkDrawer
        open
        onOpenChange={vi.fn()}
        mode="changeKind"
        location={YAWNING_PORTAL}
        {...inverseDrawerContextProps}
        characters={characters}
        connectedPartyRows={[
          {
            relationshipId: 'rel-1',
            subjectType: 'character',
            subject: {
              type: 'character',
              id: 'npc-1',
              name: 'Braggi',
              slug: 'npc-1',
              characterType: 'npc',
            },
            kind: 'works_at',
            label: 'Works at',
            family: 'operation',
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
    expect(screen.getByText('Yawning Portal')).toBeInTheDocument()
    expect(screen.getByText('Braggi')).toBeInTheDocument()
    expect(screen.getByText('NPC')).toBeInTheDocument()
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
