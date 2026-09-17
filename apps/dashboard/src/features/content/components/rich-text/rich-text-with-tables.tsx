import * as React from 'react'
import type { GeneralTable } from '@rpg/contracts'
import {
  RichTextContent,
  RICH_TEXT_TABLE_EMBED_ATTR,
  sanitizeHtml,
  type RichTextContentProps,
} from '@rpg/ui'
import { GeneralTableView } from '../tables/general-table-view'

const TABLE_UNAVAILABLE_LABEL = 'Table unavailable'

export type RichTextWithTablesProps = Omit<RichTextContentProps, 'html'> & {
  html: string
  tables?: readonly GeneralTable[]
}

type RichTextSegment = { kind: 'html'; html: string } | { kind: 'table'; tableId: string }

function segmentRichTextHtml(html: string): RichTextSegment[] {
  const sanitized = sanitizeHtml(html)
  if (sanitized.trim() === '') return []

  const document = new DOMParser().parseFromString(sanitized, 'text/html')
  const segments: RichTextSegment[] = []

  for (const child of Array.from(document.body.childNodes)) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const element = child as HTMLElement
      const tableId = element.getAttribute(RICH_TEXT_TABLE_EMBED_ATTR)?.trim()
      if (element.tagName === 'DIV' && tableId) {
        segments.push({ kind: 'table', tableId })
        continue
      }
    }

    const wrapper = document.createElement('div')
    wrapper.appendChild(child.cloneNode(true))
    const chunk = wrapper.innerHTML.trim()
    if (chunk !== '') {
      segments.push({ kind: 'html', html: chunk })
    }
  }

  return segments.length > 0 ? segments : [{ kind: 'html', html: sanitized }]
}

/** Read-only rich text that replaces table embed placeholders with structured tables. */
export function RichTextWithTables({
  html,
  tables = [],
  ...contentProps
}: RichTextWithTablesProps) {
  const tableById = React.useMemo(() => new Map(tables.map((table) => [table.id, table])), [tables])
  const segments = React.useMemo(() => segmentRichTextHtml(html), [html])

  if (segments.length === 0) return null

  return (
    <div className="space-y-4">
      {segments.map((segment, index) => {
        if (segment.kind === 'html') {
          return <RichTextContent key={`html-${index}`} html={segment.html} {...contentProps} />
        }

        const table = tableById.get(segment.tableId)
        if (!table) {
          return (
            <p key={`missing-${segment.tableId}`} className="text-sm text-muted-foreground">
              {TABLE_UNAVAILABLE_LABEL}
            </p>
          )
        }

        return <GeneralTableView key={`table-${segment.tableId}`} table={table} />
      })}
    </div>
  )
}
