import { ContentEntityCard, type ContentEntityCardProps } from '@/features/content'

/** Compact committed selection row for schema-driven content forms. */
export function ContentFormEntitySelectionRow(props: ContentEntityCardProps) {
  return <ContentEntityCard density="compact" {...props} />
}
