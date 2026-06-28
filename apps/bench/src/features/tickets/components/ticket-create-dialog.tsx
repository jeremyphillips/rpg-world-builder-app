import { useState } from 'react'

import { Button, Modal } from '@rpg/ui'
import { Form, FormSaveFooter } from '@rpg/ui/form'

import { useSubmitHandler } from '@/lib/use-submit-handler'

import {
  buildQuickCreateInput,
  quickCreateFields,
  quickCreateFormSchema,
  type QuickCreateFormValues,
} from '../lib/ticket-form-def'
import { useCreateTicket } from '../hooks/use-create-ticket'

const defaultValues: QuickCreateFormValues = {
  title: '',
  type: 'feature',
  priority: 'medium',
  size: 'm',
  description: '',
}

interface TicketCreateDialogProps {
  onCreated?: (ticketId: string) => void
}

export function TicketCreateDialog({ onCreated }: TicketCreateDialogProps) {
  const [open, setOpen] = useState(false)
  const { mutateAsync, isPending, isSuccess } = useCreateTicket()

  const { onSubmit, formError } = useSubmitHandler<QuickCreateFormValues>(async (values, form) => {
    const ticket = await mutateAsync(buildQuickCreateInput(values))
    form.reset(defaultValues)
    setOpen(false)
    onCreated?.(ticket.id)
  }, 'Could not create ticket.')

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button>New ticket</Button>
      </Modal.Trigger>
      <Modal.Content size="md">
        <Modal.Header
          headline="New ticket"
          description="Capture a gap quickly — fill in details later."
        />
        <Modal.Body>
          <Form<QuickCreateFormValues>
            schema={quickCreateFormSchema}
            fields={quickCreateFields}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            formError={formError}
            footer={(form) => (
              <FormSaveFooter
                pending={isPending || form.formState.isSubmitting}
                isSuccess={isSuccess}
                submitLabel="Create ticket"
                successMessage="Ticket created."
              />
            )}
          />
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  )
}
