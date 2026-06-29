import { useState, type ReactNode } from 'react'

import { createTicketInputSchema, type TicketStatus } from '@rpg/contracts/dev-bench'
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
  /** Pre-fill epicId on create (epic detail scoped create). */
  defaultEpicId?: string
  /** Pre-fill status on create (Bench up_next). Defaults to backlog. */
  defaultStatus?: TicketStatus
  /** Override default "New ticket" trigger; omit when using controlled open. */
  trigger?: ReactNode
  /** Controlled open state (epic detail "Add ticket" button). */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onCreated?: (ticketId: string) => void
}

export function TicketCreateDialog({
  defaultEpicId,
  defaultStatus,
  trigger,
  open: controlledOpen,
  onOpenChange,
  onCreated,
}: TicketCreateDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? onOpenChange! : setInternalOpen
  const showTrigger = trigger !== undefined || !isControlled

  const { mutateAsync, isPending, isSuccess } = useCreateTicket()

  const { onSubmit, formError } = useSubmitHandler<QuickCreateFormValues>(async (values, form) => {
    const ticket = await mutateAsync(
      createTicketInputSchema.parse({
        ...buildQuickCreateInput(values),
        epicId: defaultEpicId ?? null,
        status: defaultStatus ?? 'backlog',
      }),
    )
    form.reset(defaultValues)
    setOpen(false)
    onCreated?.(ticket.id)
  }, 'Could not create ticket.')

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      {showTrigger ? (
        <Modal.Trigger asChild>{trigger ?? <Button>New ticket</Button>}</Modal.Trigger>
      ) : null}
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
