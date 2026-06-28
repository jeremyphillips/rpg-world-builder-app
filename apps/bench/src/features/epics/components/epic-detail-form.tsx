import { useState } from 'react'

import type { Epic } from '@rpg/contracts/dev-bench'
import { Button, ConfirmDialog } from '@rpg/ui'
import { Form, FormSaveFooter } from '@rpg/ui/form'

import { useSubmitHandler } from '@/lib/use-submit-handler'

import {
  buildUpdateEpicInput,
  epicDetailFields,
  epicDetailFormSchema,
  mapEpicToDetailFormValues,
  type EpicDetailFormValues,
} from '../lib/epic-form-def'
import { useDeleteEpic } from '../hooks/use-delete-epic'
import { useUpdateEpic } from '../hooks/use-update-epic'

const DELETE_DESCRIPTION =
  'Deleting this epic will not delete its tickets. Tickets assigned to this epic will be moved back to unassigned.'

interface EpicDetailFormProps {
  epic: Epic
}

export function EpicDetailForm({ epic }: EpicDetailFormProps) {
  const { mutateAsync, isPending, isSuccess } = useUpdateEpic(epic.id)
  const { mutateAsync: deleteAsync, isPending: isDeleting } = useDeleteEpic(epic.id)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { onSubmit, formError } = useSubmitHandler<EpicDetailFormValues>(async (values, form) => {
    const updated = await mutateAsync(buildUpdateEpicInput(values))
    form.reset(mapEpicToDetailFormValues(updated))
  }, 'Could not save epic.')

  return (
    <>
      <Form<EpicDetailFormValues>
        key={epic.updatedAt}
        schema={epicDetailFormSchema}
        fields={epicDetailFields}
        defaultValues={mapEpicToDetailFormValues(epic)}
        onSubmit={onSubmit}
        formError={formError}
        footer={(form) => (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={() => setConfirmDelete(true)}
            >
              Delete epic
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Cancel
              </Button>
              <FormSaveFooter
                pending={isPending || form.formState.isSubmitting}
                isSuccess={isSuccess}
                submitLabel="Save epic"
                successMessage="Epic saved."
              />
            </div>
          </div>
        )}
      />
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        headline="Delete epic?"
        description={DELETE_DESCRIPTION}
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={() => {
          void deleteAsync()
          setConfirmDelete(false)
        }}
      />
    </>
  )
}
