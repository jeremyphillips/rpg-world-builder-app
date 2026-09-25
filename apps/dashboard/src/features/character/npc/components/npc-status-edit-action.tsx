import type { CharacterRosterState, CharacterVitalState } from '@rpg/contracts'

import { CampaignParticipatingCharacterStatusEditAction } from '../../components/detail/status/campaign-participating-character-status-edit-action'
import { toCampaignParticipatingCharacterStatusPatch } from '../../lib/campaign-participating-character-status.lib'
import { useUpdateNpcStatus } from '../hooks/use-update-npc-status'

export type NpcStatusEditActionProps = {
  campaignId: string
  npcId: string
  vital: CharacterVitalState
  roster: CharacterRosterState
}

export function NpcStatusEditAction({
  campaignId,
  npcId,
  vital,
  roster,
}: NpcStatusEditActionProps) {
  const updateStatus = useUpdateNpcStatus(campaignId, npcId)

  return (
    <CampaignParticipatingCharacterStatusEditAction
      vital={vital}
      roster={roster}
      description="Update roster and vital status for this NPC."
      errorMessage="Could not update NPC status."
      isPending={updateStatus.isPending}
      error={updateStatus.error}
      onSave={async (values) => {
        await updateStatus.mutateAsync(toCampaignParticipatingCharacterStatusPatch(values))
      }}
    />
  )
}
