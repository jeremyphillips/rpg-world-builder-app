import type { Meta, StoryObj } from '@storybook/react-vite'

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

const context: CharacterRelationshipFieldContext = {
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

const meta = {
  title: 'Character/CharacterControlledRelationshipField',
  component: CharacterControlledRelationshipField,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CharacterControlledRelationshipField>

export default meta
type Story = StoryObj<typeof meta>

export const EmptyResidence: Story = {
  name: 'Empty residence',
  args: {
    vocabulary: CHARACTER_RESIDENCE_VOCABULARY,
    registry: CHARACTER_RELATIONSHIP_FIELD_REGISTRY,
    context,
    label: 'Residence',
    emptyItemLabel: 'residence',
    addActionLabel: 'Add residence',
    items: [],
    onAdd: () => undefined,
    onRemove: () => undefined,
  },
}
