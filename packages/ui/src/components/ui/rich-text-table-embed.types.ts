export type RichTextTableEmbedResolved = {
  title: string
  metadata: string
}

export type RichTextTableEmbedCreateSession = {
  commit: (tableId: string) => void
  cancel: () => void
}

/** Dashboard host API — void callbacks, no Promise resolvers in React state. */
export type RichTextTableEmbedHost = {
  resolve(tableId: string): RichTextTableEmbedResolved | undefined
  requestCreate(session: RichTextTableEmbedCreateSession): void
  onEditTable(tableId: string): void
}
