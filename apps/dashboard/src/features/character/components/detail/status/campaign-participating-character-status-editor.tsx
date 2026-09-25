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
  toCampaignParticipatingCharacterStatusEditorValues,
  toCampaignParticipatingCharacterStatusPatch,
  type CampaignParticipatingCharacterStatusEditorValues,
} from '../../../lib/campaign-participating-character-status.lib'

function buildStatusEditorFields(): FormItem[] {
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

const STATUS_EDITOR_FIELDS = buildStatusEditorFields()

export type CampaignParticipatingCharacterStatusEditorProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  vital: CharacterVitalState
  roster: CharacterRosterState
  description: string
  errorMessage: string
  isPending: boolean
  error: unknown
  onSave: (values: CampaignParticipatingCharacterStatusEditorValues) => Promise<void>
}

export function CampaignParticipatingCharacterStatusEditor({
  open,
  onOpenChange,
  vital,
  roster,
  description,
  errorMessage,
  isPending,
  error,
  onSave,
}: CampaignParticipatingCharacterStatusEditorProps) {
  const formId = useId()
  const form = useForm<CampaignParticipatingCharacterStatusEditorValues>({
    defaultValues: toCampaignParticipatingCharacterStatusEditorValues({ vital, roster }),
  })

  useEffect(() => {
    if (open) {
      form.reset(toCampaignParticipatingCharacterStatusEditorValues({ vital, roster }))
    }
  }, [form, vital, roster, open])

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSave(values)
    onOpenChange(false)
  })

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="md" aria-busy={isPending || undefined}>
        <Modal.Header headline="Edit status" description={description} />
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
              {error ? (
                <Text variant="destructive">{getErrorMessage(error, errorMessage)}</Text>
              ) : null}
            </form>
          </FormProvider>
        </Modal.Body>
        <Modal.Footer>
          <Modal.FooterActions>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" form={formId} disabled={isPending}>
              Save
            </Button>
          </Modal.FooterActions>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}

export { toCampaignParticipatingCharacterStatusPatch }
