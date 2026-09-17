/** Persisted attribute on rich-text table embed blocks. */
export const RICH_TEXT_TABLE_EMBED_ATTR = 'data-rpg-table-id' as const

/** Attribute name passed to DOMPurify `ADD_ATTR` when sanitizing stored rich text. */
export const RICH_TEXT_TABLE_EMBED_SANITIZE_ATTRS = [RICH_TEXT_TABLE_EMBED_ATTR] as const
