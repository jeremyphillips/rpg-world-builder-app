import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, Modal } from '@rpg/ui'
import { Form, FormSaveFooter } from '@rpg/ui/form'

import { benchEpicPath } from '@/app/routes'
import { useSubmitHandler } from '@/lib/use-submit-handler'

import {
  buildCreateEpicInput,
  createEpicDefaultValues,
  createEpicFields,
  createEpicFormSchema,
  type CreateEpicFormValues,
} from '../lib/epic-form-def'
import { useCreateEpic } from '../hooks/use-create-epic'

interface CreateEpicDialogProps {
  trigger?: React.ReactNode
}

export function CreateEpicDialog({ trigger }: CreateEpicDialogProps) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { mutateAsync, isPending, isSuccess } = useCreateEpic()

  const { onSubmit, formError } = useSubmitHandler<CreateEpicFormValues>(async (values, form) => {
    const epic = await mutateAsync(buildCreateEpicInput(values))
    form.reset(createEpicDefaultValues)
    setOpen(false)
    void navigate(benchEpicPath(epic.id))
  }, 'Could not create epic.')

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>{trigger ?? <Button>Create epic</Button>}</Modal.Trigger>
      <Modal.Content size="md">
        <Modal.Header headline="New epic" description="Group related work under a shared goal." />
        <Modal.Body>
          <Form<CreateEpicFormValues>
            schema={createEpicFormSchema}
            fields={createEpicFields}
            defaultValues={createEpicDefaultValues}
            onSubmit={onSubmit}
            formError={formError}
            footer={(form) => (
              <FormSaveFooter
                pending={isPending || form.formState.isSubmitting}
                isSuccess={isSuccess}
                submitLabel="Create epic"
                successMessage="Epic created."
              />
            )}
          />
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  )
}
