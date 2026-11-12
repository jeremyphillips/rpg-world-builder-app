import { EmphasisDetailLine } from './emphasis-detail-line'
import { RichTextContent } from './rich-text-content'
import { Eyebrow } from './eyebrow'
import { Icon } from './icon/icon'
import { MetadataList } from './metadata-list'
import { Panel } from './panel'
import { SemanticText } from './semantic-text/semantic-text'
import { Text } from './text'

export type RulesPreviewMetadataRow = {
  id: string
  label: string
  primary: string
  secondary?: string
}

export type RulesPreviewContent =
  | { kind: 'metadata'; rows: readonly RulesPreviewMetadataRow[] }
  | { kind: 'prose'; text: string }
  | { kind: 'html'; html: string }
  | { kind: 'guidance'; message: string }

export type RulesPreviewProps = {
  label: string
  context?: string
  content: RulesPreviewContent
}

function metadataValue(row: RulesPreviewMetadataRow) {
  if (!row.secondary) return row.primary
  return <EmphasisDetailLine as="span" primary={row.primary} secondary={row.secondary} />
}

function rulesPreviewHasContent(content: RulesPreviewContent): boolean {
  switch (content.kind) {
    case 'prose':
      return Boolean(content.text.trim())
    case 'html':
      return Boolean(content.html.trim())
    case 'metadata':
      return content.rows.length > 0
    case 'guidance':
      return Boolean(content.message.trim())
  }
}

function RulesPreviewBody({ content }: { content: RulesPreviewContent }) {
  if (content.kind === 'metadata') {
    return (
      <MetadataList
        size="sm"
        columnGap="sm"
        valueTrack="fill"
        emphasis="value"
        divider={false}
        items={content.rows.map((row) => ({
          id: row.id,
          label: row.label,
          value: metadataValue(row),
        }))}
      />
    )
  }
  if (content.kind === 'prose') return <Text>{content.text}</Text>
  if (content.kind === 'html') {
    return <RichTextContent html={content.html} size="sm" tone="muted" />
  }
  return (
    <Text variant="caption">
      <SemanticText tone="neutral" emphasis="low" icon={<Icon name="info" size="xs" />}>
        {content.message}
      </SemanticText>
    </Text>
  )
}

/** Compact rules panel. Callers supply the label and one content shape. */
export function RulesPreview({ label, context, content }: RulesPreviewProps) {
  if (!rulesPreviewHasContent(content)) return null

  return (
    <Panel tone="subtle" density="compact">
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <Eyebrow size="sm">{label}</Eyebrow>
          {context ? (
            <Text as="span" variant="supporting">
              {context}
            </Text>
          ) : null}
        </div>
        <RulesPreviewBody content={content} />
      </div>
    </Panel>
  )
}
