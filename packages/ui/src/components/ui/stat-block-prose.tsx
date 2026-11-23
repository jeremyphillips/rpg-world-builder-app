import {
  statBlockLeadSeparator,
  type StatBlockProse,
  type StatBlockProseDocument,
  type StatBlockProseSegment,
} from '@rpg/contracts'
import type { ReactNode } from 'react'

import { Text } from './text'
import { StatBlockLead } from './stat-block-lead'

function renderSegment(segment: StatBlockProseSegment, key: number): ReactNode {
  if (segment.kind === 'text') {
    if (segment.emphasis === 'italic') {
      return (
        <em key={key}>
          <span>{segment.value}</span>
        </em>
      )
    }
    return <span key={key}>{segment.value}</span>
  }
  return (
    <StatBlockLead key={key} treatment={segment.treatment}>
      {segment.label}
    </StatBlockLead>
  )
}

function renderParagraph(prose: StatBlockProse, key?: number): ReactNode {
  if (prose.length === 0) return null
  const inner: ReactNode[] = []
  for (let index = 0; index < prose.length; index++) {
    const segment = prose[index]!
    const previous = index > 0 ? prose[index - 1] : undefined
    if (
      previous?.kind === 'lead' &&
      previous.treatment === 'paragraph' &&
      segment.kind === 'text' &&
      segment.value.length > 0 &&
      !segment.value.startsWith(' ')
    ) {
      inner.push(<span key={`${index}-lead-space`}> </span>)
    }
    inner.push(renderSegment(segment, index))
  }
  if (key === undefined) return <>{inner}</>
  return (
    <Text key={key} as="p" variant="body-compact">
      {inner}
    </Text>
  )
}

type StatBlockProseViewProps =
  | { prose: StatBlockProse; document?: never }
  | { document: StatBlockProseDocument; prose?: never }

/** Renders structured stat-block rules copy with shared lead-in emphasis. */
export function StatBlockProseView(props: StatBlockProseViewProps) {
  const document: StatBlockProseDocument = props.document ?? (props.prose ? [props.prose] : [])

  if (document.length === 0) return null
  if (document.length === 1) {
    return <>{renderParagraph(document[0]!)}</>
  }
  return (
    <div className="stat-block-prose flex flex-col gap-1">
      {document.map((paragraph, index) => renderParagraph(paragraph, index))}
    </div>
  )
}
