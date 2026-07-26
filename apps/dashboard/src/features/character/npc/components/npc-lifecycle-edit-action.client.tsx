'use client'

import { useState } from 'react'
import type { CharacterLifecycle } from '@rpg/contracts'
import { Button } from '@rpg/ui'

import { NpcLifecycleEditor } from './npc-lifecycle-editor.client'

export type NpcLifecycleEditActionProps = {
  campaignId: string
  npcId: string
  lifecycle: CharacterLifecycle
}

export function NpcLifecycleEditAction({
  campaignId,
  npcId,
  lifecycle,
}: NpcLifecycleEditActionProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Edit
      </Button>
      <NpcLifecycleEditor
        open={open}
        onOpenChange={setOpen}
        campaignId={campaignId}
        npcId={npcId}
        lifecycle={lifecycle}
      />
    </>
  )
}
