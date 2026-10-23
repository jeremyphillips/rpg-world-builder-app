'use client'

import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'

import { Button } from './button.client'
import { Icon } from './icon/icon'
import { Text } from './text'
import { getRichTextTableEmbedHost } from './rich-text-table-embed-host.client'
import {
  richTextTableEmbedCardClasses,
  richTextTableEmbedCardContentClasses,
  richTextTableEmbedCardHeaderClasses,
  richTextTableEmbedCardMetadataClasses,
  richTextTableEmbedCardTitleStackClasses,
  richTextTableEmbedCardTitleClasses,
  richTextTableEmbedCardActionsClasses,
  richTextTableEmbedCardIconClasses,
  richTextTableEmbedRemoveButtonClasses,
} from './rich-text-table-embed-node.variants'

const FALLBACK_TITLE = 'Table'
const FALLBACK_METADATA = 'Structured table'

export function RichTextTableEmbedNode({ node, deleteNode, selected }: NodeViewProps) {
  const tableId = typeof node.attrs.tableId === 'string' ? node.attrs.tableId : ''
  const host = getRichTextTableEmbedHost()
  const resolved = tableId ? host?.resolve(tableId) : undefined
  const title = resolved?.title ?? FALLBACK_TITLE
  const metadata = resolved?.metadata ?? FALLBACK_METADATA

  return (
    <NodeViewWrapper as="div" contentEditable={false} data-selected={selected ? 'true' : undefined}>
      <div className={richTextTableEmbedCardClasses({ selected: Boolean(selected) })}>
        <div className={richTextTableEmbedCardContentClasses}>
          <div className={richTextTableEmbedCardHeaderClasses}>
            <Icon name="table" size="md" className={richTextTableEmbedCardIconClasses} />
            <div className={richTextTableEmbedCardTitleStackClasses}>
              <Text as="p" className={richTextTableEmbedCardTitleClasses}>
                {title}
              </Text>
              <Text variant="muted" className={richTextTableEmbedCardMetadataClasses}>
                {metadata}
              </Text>
            </div>
          </div>
          <div className={richTextTableEmbedCardActionsClasses}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`Edit table ${title}`}
              onClick={() => {
                if (tableId) host?.onEditTable(tableId)
              }}
            >
              <Icon name="pencil" size="owner" />
              Edit table
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={richTextTableEmbedRemoveButtonClasses}
              aria-label={`Remove table ${title}`}
              onClick={() => deleteNode()}
            >
              <Icon name="trash" size="owner" />
            </Button>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  )
}
