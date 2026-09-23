import type { CharacterRelationshipProjectionRow } from '@rpg/contracts'

import { filterPropertyEligibleLocations } from '../../../lib/connections/property-location-connection.lib'
import { filterResidenceEligibleLocations } from '../../../lib/connections/residence-location-connection.lib'
import type { CharacterPickerOption } from '../../../lib/picker/character-picker-option.lib'
import type { ConnectionSheetData } from '../../../lib/relationship/connection-sheet-data.lib'
import {
  cityCouncil,
  lanternGuild,
} from '../../connections/picker/organization-picker-drawer.fixtures'
import { harborfordSettlement } from '../../connections/picker/residence-location-picker-drawer.fixtures'

const campaignCharacterOptions: CharacterPickerOption[] = [
  {
    id: 'npc-darius',
    name: 'Darius Vale',
    summary: 'NPC · Rogue 3',
    characterType: 'npc',
    classIds: ['class-rogue'],
  },
  {
    id: 'pc-aria',
    name: 'Aria Thorn',
    summary: 'PC · Wizard 2',
    characterType: 'pc',
    classIds: ['class-wizard'],
  },
]

const allLocations = [harborfordSettlement]

export const connectionSheetDataFixture: ConnectionSheetData = {
  campaignId: 'campaign-1',
  characterId: 'character-1',
  availableOrganizations: [lanternGuild, cityCouncil],
  organizationsById: new Map([
    [lanternGuild.id, lanternGuild],
    [cityCouncil.id, cityCouncil],
  ]),
  locationsById: new Map([[harborfordSettlement.id, harborfordSettlement]]),
  charactersById: new Map(campaignCharacterOptions.map((character) => [character.id, character])),
  campaignCharacterOptions,
  eligibleResidenceLocations: filterResidenceEligibleLocations(allLocations),
  eligiblePropertyLocations: filterPropertyEligibleLocations(allLocations),
  allLocations,
  locationsQueryStatus: { status: 'success' },
}

export const organizationMembershipProjectionFixture: CharacterRelationshipProjectionRow = {
  relationshipId: 'edge-org-1',
  kind: 'organizationMembership',
  section: 'organizations',
  roleLabel: 'Member of Lantern Guild',
  details: { lifecycle: 'current', title: 'Guildmaster' },
  visibility: 'dm_only',
  participantIds: [],
  referenceStatus: 'resolved',
  revision: 1,
  capabilities: { canUpdateDetails: true, canDelete: true },
  target: {
    type: 'organization',
    id: lanternGuild.id,
    name: lanternGuild.name,
    slug: lanternGuild.slug,
  },
}

export const personProjectionFixture: CharacterRelationshipProjectionRow = {
  relationshipId: 'edge-person-1',
  kind: 'friendOf',
  section: 'people.social',
  roleLabel: 'Friend',
  details: { lifecycle: 'current' },
  visibility: 'specific_players',
  participantIds: ['pc-aria'],
  referenceStatus: 'resolved',
  revision: 2,
  capabilities: { canUpdateDetails: true, canDelete: true },
  target: {
    type: 'character',
    id: 'npc-darius',
    name: 'Darius Vale',
    characterType: 'npc',
  },
}

export const residenceProjectionFixture: CharacterRelationshipProjectionRow = {
  relationshipId: 'edge-place-1',
  kind: 'resides_at',
  section: 'places',
  roleLabel: 'Residence',
  details: { lifecycle: 'current', isPrimary: true },
  visibility: 'dm_only',
  participantIds: [],
  referenceStatus: 'resolved',
  revision: 1,
  capabilities: { canUpdateDetails: true, canDelete: true },
  target: {
    type: 'location',
    id: harborfordSettlement.id,
    name: harborfordSettlement.name,
    slug: harborfordSettlement.slug,
  },
}
