import type { CharacterRosterState, CharacterVitalState } from '@rpg/contracts'

import { CampaignParticipatingCharacterStatusEditor } from '../../components/detail/status/campaign-participating-character-status-editor'
import { toCampaignParticipatingCharacterStatusPatch } from '../../lib/campaign-participating-character-status.lib'
import { useUpdateNpcStatus } from '../hooks/use-update-npc-status'

export type NpcStatusEditorProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  npcId: string
  vital: CharacterVitalState
  roster: CharacterRosterState
}

export function NpcStatusEditor({
  open,
  onOpenChange,
  campaignId,
  npcId,
  vital,
  roster,
}: NpcStatusEditorProps) {
  const updateStatus = useUpdateNpcStatus(campaignId, npcId)

  return (
    <CampaignParticipatingCharacterStatusEditor
      open={open}
      onOpenChange={onOpenChange}
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
