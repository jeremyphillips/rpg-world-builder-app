import type { ReactElement, ReactNode } from 'react'
import type { ContentTable, FacingBlock } from '@rpg/contracts'

import { RichTextContent } from './rich-text-content'
import { StatBlockProseView } from './stat-block-prose'

export type FacingBodyProps = {
  blocks: readonly FacingBlock[]
  /** Rich-text tone for description-style blocks. */
  proseTone?: 'default' | 'muted'
  /** Table blocks require a host renderer — omitted tables are skipped. */
  renderTable?: (table: ContentTable) => ReactNode
}

function FacingBlockView({
  block,
  proseTone,
  renderTable,
}: {
  block: FacingBlock
  proseTone: 'default' | 'muted'
  renderTable?: (table: ContentTable) => ReactNode
}): ReactElement | null {
  switch (block.kind) {
    case 'richText':
      return <RichTextContent html={block.html} size="sm" tone={proseTone} />
    case 'rules':
      return <StatBlockProseView document={block.document} />
    case 'table':
      return renderTable ? <>{renderTable(block.table)}</> : null
  }

  const unsupported: never = block
  throw new Error('Unsupported facing block', { cause: unsupported })
}

/** Maps structured facing blocks to read-only presentation primitives. */
export function FacingBody({ blocks, proseTone = 'muted', renderTable }: FacingBodyProps) {
  const visible = blocks.filter((block) => block.kind !== 'table' || renderTable !== undefined)
  if (visible.length === 0) return null

  return (
    <div className="facing-body flex flex-col gap-1">
      {visible.map((block, index) => (
        <FacingBlockView
          key={index}
          block={block}
          proseTone={proseTone}
          renderTable={renderTable}
        />
      ))}
    </div>
  )
}
