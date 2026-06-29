import { useMemo, useState } from 'react'
import { useFormContext, type UseFormReturn } from 'react-hook-form'

import type { Ticket } from '@rpg/contracts/dev-bench'
import { parseAcceptanceCriteria } from '@rpg/dev-bench-core'
import { Button, Sheet, Text, Textarea } from '@rpg/ui'
import { FormFooterActions, TabbedForm, formStickyTabsTransparentClasses } from '@rpg/ui/form'

import { useSubmitHandler } from '@/lib/use-submit-handler'

import {
  buildTicketDetailTabs,
  buildUpdateTicketInput,
  mapTicketToDetailFormValues,
  ticketDetailFormSchema,
  type TicketDetailFormValues,
} from '../lib/ticket-form-def'
import { useEpicsList } from '@/features/epics'
import { useTickets } from '../hooks/use-tickets'
import { useUpdateTicket } from '../hooks/use-update-ticket'
import { TicketMetaTimestamps } from './ticket-meta'

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
  /** Page uses sticky footer chrome; sheet pins actions in `Sheet.Footer`. */
  layout?: 'page' | 'sheet'
}

export function TicketDetailForm({ ticket, layout = 'page' }: TicketDetailFormProps) {
  const { data: epics = [] } = useEpicsList()
  const { data: allTickets = [] } = useTickets({})
  const { mutateAsync, isPending, isSuccess } = useUpdateTicket(ticket.id)

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

  const footer = (form: UseFormReturn<TicketDetailFormValues>) => (
    <FormFooterActions
      secondary={
        <Button
          type="button"
          variant="link"
          className="text-foreground hover:text-foreground"
          onClick={() => form.reset()}
        >
          Cancel
        </Button>
      }
      pending={isPending || form.formState.isSubmitting}
      isSuccess={isSuccess}
      submitLabel="Save ticket"
      successMessage="Ticket saved."
    />
  )

  const isSheetLayout = layout === 'sheet'

  return (
    <TabbedForm<TicketDetailFormValues>
      key={ticket.updatedAt}
      schema={ticketDetailFormSchema}
      tabs={tabs}
      defaultValues={mapTicketToDetailFormValues(ticket)}
      onSubmit={onSubmit}
      formError={formError}
      className={isSheetLayout ? 'flex min-h-0 flex-1 flex-col' : undefined}
      stickyTabsClassName={isSheetLayout ? formStickyTabsTransparentClasses : undefined}
      contentWrapper={
        isSheetLayout
          ? (content) => (
              <Sheet.Body className="space-y-4">
                <TicketMetaTimestamps ticket={ticket} />
                {content}
              </Sheet.Body>
            )
          : undefined
      }
      footerWrapper={
        isSheetLayout
          ? ({ footer: footerContent, formError: footerFormError }) => (
              <Sheet.Footer className="flex-col items-stretch gap-3">
                {footerFormError ? (
                  <Text variant="destructive" role="alert">
                    {footerFormError}
                  </Text>
                ) : null}
                {footerContent}
              </Sheet.Footer>
            )
          : undefined
      }
      footer={footer}
    />
  )
}
