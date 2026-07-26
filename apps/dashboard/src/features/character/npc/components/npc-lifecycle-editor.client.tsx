'use client'

import { useEffect, useId } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import {
  CHARACTER_ROSTER_STATUS_ENTRIES,
  CHARACTER_ROSTER_STATUSES,
  CHARACTER_VITAL_STATUS_ENTRIES,
  CHARACTER_VITAL_STATUSES,
  type CharacterLifecycle,
} from '@rpg/contracts'
import { Button, Modal, Text } from '@rpg/ui'
import { FormFieldStack } from '@rpg/ui/form'
import type { FormItem } from '@rpg/ui/form'

import {
  toNpcLifecycleEditorValues,
  toNpcLifecyclePatch,
  useUpdateNpcLifecycle,
  type NpcLifecycleEditorValues,
} from '../hooks/use-update-npc-lifecycle'

function buildNpcLifecycleEditorFields(): FormItem[] {
  return [
    {
      type: 'select',
      name: 'rosterStatus',
      label: 'Roster status',
      width: 'full',
      size: 'sm',
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
      size: 'sm',
      rows: 3,
    },
    {
      type: 'select',
      name: 'vitalStatus',
      label: 'Vital status',
      width: 'full',
      size: 'sm',
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
      size: 'sm',
      rows: 3,
    },
  ]
}

const LIFECYCLE_EDITOR_FIELDS = buildNpcLifecycleEditorFields()

export type NpcLifecycleEditorProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  npcId: string
  lifecycle: CharacterLifecycle
}

export function NpcLifecycleEditor({
  open,
  onOpenChange,
  campaignId,
  npcId,
  lifecycle,
}: NpcLifecycleEditorProps) {
  const formId = useId()
  const form = useForm<NpcLifecycleEditorValues>({
    defaultValues: toNpcLifecycleEditorValues(lifecycle),
  })
  const updateLifecycle = useUpdateNpcLifecycle(campaignId, npcId)

  useEffect(() => {
    if (open) {
      form.reset(toNpcLifecycleEditorValues(lifecycle))
    }
  }, [form, lifecycle, open])

  const handleSubmit = form.handleSubmit(async (values) => {
    await updateLifecycle.mutateAsync(toNpcLifecyclePatch(values))
    onOpenChange(false)
  })

  const handleOpenAutoFocus = (event: Event) => {
    event.preventDefault()
    const content = event.currentTarget as HTMLElement
    const firstField = content.querySelector<HTMLElement>('[role="combobox"], select, textarea')
    firstField?.focus()
  }

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content
        size="md"
        aria-busy={updateLifecycle.isPending || undefined}
        onOpenAutoFocus={handleOpenAutoFocus}
      >
        <Modal.Header
          headline="Edit lifecycle"
          description="Update roster and vital status for this NPC."
        />
        <Modal.Body>
          <FormProvider {...form}>
            <form id={formId} onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
              <FormFieldStack
                fields={LIFECYCLE_EDITOR_FIELDS}
                idPrefix={formId}
                size="md"
                rhythm="comfortable"
              />
              {lifecycle.roster.changedAt ? (
                <Text variant="muted">
                  Roster updated {new Date(lifecycle.roster.changedAt).toLocaleString()}
                </Text>
              ) : null}
              {lifecycle.vital.changedAt ? (
                <Text variant="muted">
                  Vital updated {new Date(lifecycle.vital.changedAt).toLocaleString()}
                </Text>
              ) : null}
              {updateLifecycle.error ? (
                <Text variant="destructive">{updateLifecycle.error.message}</Text>
              ) : null}
            </form>
          </FormProvider>
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={updateLifecycle.isPending}>
            Save
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
