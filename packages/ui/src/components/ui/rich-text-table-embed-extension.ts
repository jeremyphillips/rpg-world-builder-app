import { Node, mergeAttributes } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'
import { ReactNodeViewRenderer } from '@tiptap/react'
import type { Editor } from '@tiptap/core'

import { RICH_TEXT_TABLE_EMBED_ATTR } from '../../lib/rich-text-table-embed-attrs'
import { getRichTextTableEmbedHost } from './rich-text-table-embed-host.client'
import { RichTextTableEmbedNode } from './rich-text-table-embed-node.client'
import type { RichTextTableEmbedCreateSession } from './rich-text-table-embed.types'

type PendingCreateState = {
  from: number
  session: RichTextTableEmbedCreateSession
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableEmbed: {
      insertTableEmbedAtSavedPosition: (tableId: string) => ReturnType
      beginTableEmbedCreate: () => ReturnType
      cancelTableEmbedCreate: () => ReturnType
    }
  }

  interface Storage {
    tableEmbed: {
      pendingCreate: PendingCreateState | null
    }
  }
}

function insertEmbedAtPosition(editor: Editor, tableId: string, from: number) {
  const transaction = editor.state.tr
  const mapped = transaction.mapping.map(from)
  const node = editor.schema.nodes.tableEmbed?.create({ tableId })
  if (!node) return false

  transaction.insert(mapped, node)
  transaction.setSelection(TextSelection.near(transaction.doc.resolve(mapped + node.nodeSize)))
  editor.view.dispatch(transaction)
  return true
}

function insertEmbedAtEnd(editor: Editor, tableId: string) {
  return editor.chain().focus('end').insertContent({ type: 'tableEmbed', attrs: { tableId } }).run()
}

/** Atomic rich-text block referencing a structured table by id. */
export const RichTextTableEmbed = Node.create({
  name: 'tableEmbed',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: false,

  addStorage() {
    return {
      pendingCreate: null as PendingCreateState | null,
    }
  },

  addAttributes() {
    return {
      tableId: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute(RICH_TEXT_TABLE_EMBED_ATTR),
        renderHTML: (attributes: Record<string, unknown>) => {
          const value = attributes.tableId
          if (typeof value !== 'string' || value.length === 0) return {}
          return { [RICH_TEXT_TABLE_EMBED_ATTR]: value }
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: `div[${RICH_TEXT_TABLE_EMBED_ATTR}]` }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(RichTextTableEmbedNode)
  },

  addCommands() {
    return {
      insertTableEmbedAtSavedPosition:
        (tableId: string) =>
        ({ editor }) => {
          const pending = editor.storage.tableEmbed.pendingCreate
          editor.storage.tableEmbed.pendingCreate = null

          if (!pending) {
            return insertEmbedAtEnd(editor, tableId)
          }

          const inserted = insertEmbedAtPosition(editor, tableId, pending.from)
          if (!inserted) {
            return insertEmbedAtEnd(editor, tableId)
          }
          return true
        },
      beginTableEmbedCreate:
        () =>
        ({ editor }) => {
          const host = getRichTextTableEmbedHost()
          if (!host) return false

          const from = editor.state.selection.from

          const session: RichTextTableEmbedCreateSession = {
            commit: (tableId: string) => {
              editor.commands.insertTableEmbedAtSavedPosition(tableId)
            },
            cancel: () => {
              editor.storage.tableEmbed.pendingCreate = null
            },
          }

          editor.storage.tableEmbed.pendingCreate = { from, session }
          host.requestCreate(session)
          return true
        },
      cancelTableEmbedCreate:
        () =>
        ({ editor }) => {
          const pending = editor.storage.tableEmbed.pendingCreate
          pending?.session.cancel()
          editor.storage.tableEmbed.pendingCreate = null
          return true
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        if (!editor.isActive('tableEmbed')) return false
        return editor.commands.deleteSelection()
      },
    }
  },
})
