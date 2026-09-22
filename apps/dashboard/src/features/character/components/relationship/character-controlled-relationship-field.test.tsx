import type { ComponentProps } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { makeLocation } from '@/test/fixtures/factories/location'

import { CharacterControlledRelationshipField } from './character-controlled-relationship-field'
import {
  CHARACTER_RELATIONSHIP_FIELD_REGISTRY,
  CHARACTER_RESIDENCE_VOCABULARY,
} from '../../lib/relationship/character-relationship-field-registry'
import type { CharacterRelationshipFieldContext } from '../../lib/relationship/character-relationship-field-context.types'

const residence = makeLocation({
  id: 'location-harborford',
  slug: 'harborford',
  name: 'Harborford',
  kind: 'settlement',
  settlementType: 'city',
})

const baseContext: CharacterRelationshipFieldContext = {
  mode: 'api',
  campaignId: 'campaign-1',
  organizationsById: new Map(),
  locationsById: new Map([[residence.id, residence]]),
  availableOrganizationIdSet: new Set(),
  availableResidenceIdSet: new Set([residence.id]),
  availableOrganizations: [],
  eligibleResidenceLocations: [residence],
  locationsQueryStatus: { status: 'success' },
}

function renderField(props: ComponentProps<typeof CharacterControlledRelationshipField>) {
  return render(
    <MemoryRouter>
      <CharacterControlledRelationshipField {...props} />
    </MemoryRouter>,
  )
}

describe('CharacterControlledRelationshipField', () => {
  it('renders an empty residence state and opens the add picker', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()

    renderField({
      vocabulary: CHARACTER_RESIDENCE_VOCABULARY,
      registry: CHARACTER_RELATIONSHIP_FIELD_REGISTRY,
      context: baseContext,
      label: 'Residence',
      emptyItemLabel: 'residence',
      addActionLabel: 'Add residence',
      items: [],
      onAdd,
      onRemove: vi.fn(),
    })

    expect(screen.getByText('No residence added.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add residence' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('shows remove failures without hiding the row', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn().mockRejectedValue(new Error('Could not remove this residence.'))

    renderField({
      vocabulary: CHARACTER_RESIDENCE_VOCABULARY,
      registry: CHARACTER_RELATIONSHIP_FIELD_REGISTRY,
      context: baseContext,
      label: 'Residence',
      emptyItemLabel: 'residence',
      addActionLabel: 'Add residence',
      items: [
        {
          connection: {
            id: 'conn-1',
            locationId: residence.id,
            kind: 'resides_at',
          },
          location: residence,
        },
      ],
      onAdd: vi.fn(),
      onRemove,
    })

    await user.click(screen.getByRole('button', { name: /Remove .*Harborford/ }))

    await waitFor(() => {
      expect(screen.getByText('Could not remove this residence.')).toBeInTheDocument()
    })
    expect(screen.getByText('Harborford')).toBeInTheDocument()
  })
})
