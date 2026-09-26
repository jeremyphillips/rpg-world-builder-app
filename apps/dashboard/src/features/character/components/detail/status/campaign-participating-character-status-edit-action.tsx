import { useState } from 'react'
import type { CharacterRosterState, CharacterVitalState } from '@rpg/contracts'
import { Button } from '@rpg/ui'

import {
  CampaignParticipatingCharacterStatusEditor,
  type CampaignParticipatingCharacterStatusEditorProps,
} from './campaign-participating-character-status-editor'

export type CampaignParticipatingCharacterStatusEditActionProps = {
  vital: CharacterVitalState
  roster: CharacterRosterState
  description: string
  errorMessage: string
  isPending: boolean
  error: unknown
  onSave: CampaignParticipatingCharacterStatusEditorProps['onSave']
}

export function CampaignParticipatingCharacterStatusEditAction({
  vital,
  roster,
  description,
  errorMessage,
  isPending,
  error,
  onSave,
}: CampaignParticipatingCharacterStatusEditActionProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Edit
      </Button>
      <CampaignParticipatingCharacterStatusEditor
        open={open}
        onOpenChange={setOpen}
        vital={vital}
        roster={roster}
        description={description}
        errorMessage={errorMessage}
        isPending={isPending}
        error={error}
        onSave={async (values) => {
          await onSave(values)
        }}
      />
    </>
  )
}
