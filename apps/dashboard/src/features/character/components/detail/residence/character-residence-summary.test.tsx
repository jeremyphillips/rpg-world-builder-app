import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { harborfordSettlement } from '../../connections/picker/residence-location-picker-drawer.fixtures'
import { CharacterResidenceSummary } from './character-residence-summary'

describe('CharacterResidenceSummary', () => {
  it('links resolved residences to the location detail route', () => {
    render(
      <MemoryRouter>
        <CharacterResidenceSummary
          campaignId="camp-1"
          locationReferences={[
            {
              connection: {
                id: 'conn-1',
                locationId: harborfordSettlement.id,
                kind: 'resides_at',
              },
              location: harborfordSettlement,
            },
          ]}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Residence')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Harborford' })).toHaveAttribute(
      'href',
      '/campaigns/camp-1/locations/location-harborford',
    )
  })

  it('supports add and remove actions when editable', async () => {
    const user = userEvent.setup()
    const onAddResidence = vi.fn()
    const onRemoveResidence = vi.fn()

    render(
      <MemoryRouter>
        <CharacterResidenceSummary
          campaignId="camp-1"
          canEdit
          onAddResidence={onAddResidence}
          onRemoveResidence={onRemoveResidence}
          locationReferences={[
            {
              connection: {
                id: 'conn-1',
                locationId: harborfordSettlement.id,
                kind: 'resides_at',
              },
              location: harborfordSettlement,
            },
          ]}
        />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: '+ Add residence' }))
    expect(onAddResidence).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Remove residence at Harborford' }))
    expect(onRemoveResidence).toHaveBeenCalledWith('conn-1', harborfordSettlement.id)
  })
})
