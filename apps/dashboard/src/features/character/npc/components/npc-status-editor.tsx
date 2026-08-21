import { useEffect, useId } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import {
  CHARACTER_ROSTER_STATUS_ENTRIES,
  CHARACTER_ROSTER_STATUSES,
  CHARACTER_VITAL_STATUS_ENTRIES,
  CHARACTER_VITAL_STATUSES,
  getErrorMessage,
  type CharacterRosterState,
  type CharacterVitalState,
} from '@rpg/contracts'
import { Button, Modal, Text } from '@rpg/ui'
import { FormFieldStack } from '@rpg/ui/form'
import type { FormItem } from '@rpg/ui/form'

import {
  toNpcStatusEditorValues,
  toNpcStatusPatch,
  useUpdateNpcStatus,
  type NpcStatusEditorValues,
} from '../hooks/use-update-npc-status'

function buildNpcStatusEditorFields(): FormItem[] {
  return [
    {
      type: 'select',
      name: 'rosterStatus',
      label: 'Roster status',
      width: 'full',
      options: CHARACTER_ROSTER_STATUSES.map((value) => ({
        value,
        label: CHARACTER_ROSTER_STATUS_ENTRIES[value].label,
      })),
    },
    {
      type: 'textarea',
      name: 'rosterNote',
      label: 'Roster note',
      width: 'full',
      rows: 3,
    },
    {
      type: 'select',
      name: 'vitalStatus',
      label: 'Vital status',
      width: 'full',
      options: CHARACTER_VITAL_STATUSES.map((value) => ({
        value,
        label: CHARACTER_VITAL_STATUS_ENTRIES[value].label,
      })),
    },
    {
      type: 'textarea',
      name: 'vitalNote',
      label: 'Vital note',
      width: 'full',
      rows: 3,
    },
  ]
}

const STATUS_EDITOR_FIELDS = buildNpcStatusEditorFields()

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
  const formId = useId()
  const form = useForm<NpcStatusEditorValues>({
    defaultValues: toNpcStatusEditorValues({ vital, roster }),
  })
  const updateStatus = useUpdateNpcStatus(campaignId, npcId)

  useEffect(() => {
    if (open) {
      form.reset(toNpcStatusEditorValues({ vital, roster }))
    }
  }, [form, vital, roster, open])

  const handleSubmit = form.handleSubmit(async (values) => {
    await updateStatus.mutateAsync(toNpcStatusPatch(values))
    onOpenChange(false)
  })

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="md" aria-busy={updateStatus.isPending || undefined}>
        <Modal.Header
          headline="Edit status"
          description="Update roster and vital status for this NPC."
        />
        <Modal.Body>
          <FormProvider {...form}>
            <form id={formId} onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
              <FormFieldStack fields={STATUS_EDITOR_FIELDS} idPrefix={formId} density="compact" />
              {roster.changedAt ? (
                <Text variant="muted">
                  Roster updated {new Date(roster.changedAt).toLocaleString()}
                </Text>
              ) : null}
              {vital.changedAt ? (
                <Text variant="muted">
                  Vital updated {new Date(vital.changedAt).toLocaleString()}
                </Text>
              ) : null}
              {updateStatus.error ? (
                <Text variant="destructive">
                  {getErrorMessage(updateStatus.error, 'Could not update NPC status.')}
                </Text>
              ) : null}
            </form>
          </FormProvider>
        </Modal.Body>
        <Modal.Footer>
          <Modal.FooterActions>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" form={formId} disabled={updateStatus.isPending}>
              Save
            </Button>
          </Modal.FooterActions>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
