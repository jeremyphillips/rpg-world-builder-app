import { useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'

import type { Ticket } from '@rpg/contracts/dev-bench'
import { parseAcceptanceCriteria } from '@rpg/dev-bench-core'
import { Button, ConfirmDialog, Text, Textarea } from '@rpg/ui'
import {
  FormFooterActions,
  TabbedForm,
  formStickyActionsBarTransparentClasses,
  formStickyTabsTransparentClasses,
} from '@rpg/ui/form'

import { useSubmitHandler } from '@/lib/use-submit-handler'

import {
  buildTicketDetailTabs,
  buildUpdateTicketInput,
  mapTicketToDetailFormValues,
  ticketDetailFormSchema,
  type TicketDetailFormValues,
} from '../lib/ticket-form-def'
import { useDeleteTicket } from '../hooks/use-delete-ticket'
import { useEpicsList } from '@/features/epics'
import { useTickets } from '../hooks/use-tickets'
import { useUpdateTicket } from '../hooks/use-update-ticket'

function AcceptanceCriteriaPasteHelper() {
  const form = useFormContext<TicketDetailFormValues>()
  const [raw, setRaw] = useState('')

  function handleApply(append: boolean) {
    const parsed = parseAcceptanceCriteria(raw)
    if (parsed.length === 0) return

    const existing = form.getValues('acceptanceCriteria')
    const nextItems = parsed.map((text) => ({ text }))
    form.setValue('acceptanceCriteria', append ? [...existing, ...nextItems] : nextItems, {
      shouldDirty: true,
    })
    setRaw('')
  }

  return (
    <div className="space-y-2 rounded-md border border-border p-3">
      <Text variant="small" className="font-medium">
        Paste bullets
      </Text>
      <Textarea
        value={raw}
        onChange={(event) => setRaw(event.target.value)}
        placeholder={'Paste markdown bullets, one per line\n- First item\n- Second item'}
        rows={4}
      />
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => handleApply(false)}>
          Replace criteria
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={() => handleApply(true)}>
          Append criteria
        </Button>
      </div>
    </div>
  )
}

interface TicketDetailFormProps {
  ticket: Ticket
  /** Transparent sticky chrome for sheet/drawer surfaces. */
  transparentStickyChrome?: boolean
}

export function TicketDetailForm({
  ticket,
  transparentStickyChrome = false,
}: TicketDetailFormProps) {
  const { data: epics = [] } = useEpicsList()
  const { data: allTickets = [] } = useTickets({})
  const { mutateAsync, isPending, isSuccess } = useUpdateTicket(ticket.id)
  const { mutateAsync: deleteAsync, isPending: isDeleting } = useDeleteTicket(ticket.id)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const ticketLinkOptions = useMemo(
    () =>
      allTickets
        .filter((item) => item.id !== ticket.id)
        .map((item) => ({
          value: item.id,
          label: `${item.key} — ${item.title}`,
          description: item.status,
        })),
    [allTickets, ticket.id],
  )

  const epicOptions = useMemo(
    () => epics.map((epic) => ({ value: epic.id, label: epic.title })),
    [epics],
  )

  const tabs = useMemo(() => {
    const built = buildTicketDetailTabs({ epicOptions, ticketLinkOptions })
    return built.map((tab) =>
      tab.id === 'done-when' ? { ...tab, header: <AcceptanceCriteriaPasteHelper /> } : tab,
    )
  }, [epicOptions, ticketLinkOptions])

  const { onSubmit, formError } = useSubmitHandler<TicketDetailFormValues>(async (values, form) => {
    const updated = await mutateAsync(buildUpdateTicketInput(values))
    form.reset(mapTicketToDetailFormValues(updated))
  }, 'Could not save ticket.')

  return (
    <>
      <TabbedForm<TicketDetailFormValues>
        key={ticket.updatedAt}
        schema={ticketDetailFormSchema}
        tabs={tabs}
        defaultValues={mapTicketToDetailFormValues(ticket)}
        onSubmit={onSubmit}
        formError={formError}
        stickyTabsClassName={transparentStickyChrome ? formStickyTabsTransparentClasses : undefined}
        stickyActionsBarClassName={
          transparentStickyChrome ? formStickyActionsBarTransparentClasses : undefined
        }
        footer={(form) => (
          <FormFooterActions
            leading={
              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting}
                onClick={() => setConfirmDelete(true)}
              >
                Delete ticket
              </Button>
            }
            secondary={
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Cancel
              </Button>
            }
            pending={isPending || form.formState.isSubmitting}
            isSuccess={isSuccess}
            submitLabel="Save ticket"
            successMessage="Ticket saved."
          />
        )}
      />
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        headline="Delete ticket?"
        description="This permanently removes the ticket. Linked references may become invalid."
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
