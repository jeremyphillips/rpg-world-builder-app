import type {
  CampaignParticipatingCharacterStatusPatch,
  CharacterRosterState,
  CharacterVitalState,
} from '@rpg/contracts'

export type CampaignParticipatingCharacterStatusEditorValues = {
  rosterStatus: CharacterRosterState['status']
  vitalStatus: CharacterVitalState['status']
  rosterNote: string
  vitalNote: string
}

export function toCampaignParticipatingCharacterStatusEditorValues(input: {
  vital: CharacterVitalState
  roster: CharacterRosterState
}): CampaignParticipatingCharacterStatusEditorValues {
  return {
    rosterStatus: input.roster.status,
    vitalStatus: input.vital.status,
    rosterNote: input.roster.note ?? '',
    vitalNote: input.vital.note ?? '',
  }
}

export function toCampaignParticipatingCharacterStatusPatch(
  values: CampaignParticipatingCharacterStatusEditorValues,
): CampaignParticipatingCharacterStatusPatch {
  return {
    roster: {
      status: values.rosterStatus,
      note: values.rosterNote.trim() === '' ? '' : values.rosterNote.trim(),
    },
    vital: {
      status: values.vitalStatus,
      note: values.vitalNote.trim() === '' ? '' : values.vitalNote.trim(),
    },
  }
}
