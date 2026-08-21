import { useState } from 'react'
import type { CharacterRosterState, CharacterVitalState } from '@rpg/contracts'
import { Button } from '@rpg/ui'

import { NpcStatusEditor } from './npc-status-editor'

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
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Edit
      </Button>
      <NpcStatusEditor
        open={open}
        onOpenChange={setOpen}
        campaignId={campaignId}
        npcId={npcId}
        vital={vital}
        roster={roster}
      />
    </>
  )
}
