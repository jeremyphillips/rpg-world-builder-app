import type { Ticket } from '@rpg/contracts/dev-bench'
import type { ComboboxFieldOption } from '@rpg/ui'
import { cn, Text } from '@rpg/ui'
import { X } from 'lucide-react'

import { benchTicketPath } from '@/app/routes'

import {
  ticketLinkSelectedPreviewBodyClasses,
  ticketLinkSelectedPreviewClasses,
  ticketLinkSelectedPreviewKeyClasses,
  ticketLinkSelectedPreviewLinkClasses,
  ticketLinkSelectedPreviewRemoveClasses,
  ticketLinkSelectedPreviewTitleClasses,
} from './ticket-link-selected-preview.variants'

interface TicketLinkSelectedPreviewProps {
  option: ComboboxFieldOption
  ticket?: Ticket | null
  onRemove: () => void
  disabled?: boolean
}

function resolveTicketKeyAndTitle(option: ComboboxFieldOption, ticket?: Ticket | null) {
  if (ticket) {
    return { key: ticket.key, title: ticket.title }
  }

  const separatorIndex = option.label.indexOf(' — ')
  if (separatorIndex !== -1) {
    return {
      key: option.label.slice(0, separatorIndex),
      title: option.label.slice(separatorIndex + 3),
    }
  }

  return { key: 'Unknown ticket', title: option.label }
}

/** Compact selected-ticket preview for combobox multi-select fields. */
export function TicketLinkSelectedPreview({
  option,
  ticket,
  onRemove,
  disabled,
}: TicketLinkSelectedPreviewProps) {
  const { key, title } = resolveTicketKeyAndTitle(option, ticket)
  const detailHref = option.value ? benchTicketPath(option.value) : undefined

  const body = (
    <>
      <Text className={ticketLinkSelectedPreviewKeyClasses}>{key}</Text>
      <Text className={ticketLinkSelectedPreviewTitleClasses}>{title}</Text>
    </>
  )

  return (
    <div className={ticketLinkSelectedPreviewClasses}>
      {detailHref ? (
        <a
          href={detailHref}
          target="_blank"
          rel="noopener noreferrer"
          className={ticketLinkSelectedPreviewLinkClasses}
          aria-label={`Open ${key} in new tab`}
        >
          {body}
        </a>
      ) : (
        <div className={ticketLinkSelectedPreviewBodyClasses}>{body}</div>
      )}
      <button
        type="button"
        className={cn(ticketLinkSelectedPreviewRemoveClasses)}
        aria-label={`Remove ${key}`}
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation()
          onRemove()
        }}
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  )
}
