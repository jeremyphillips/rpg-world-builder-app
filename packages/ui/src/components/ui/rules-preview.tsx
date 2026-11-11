import { EmphasisDetailLine } from './emphasis-detail-line'
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

/** Compact rules panel. Callers supply the label and one content shape. */
export function RulesPreview({ label, context, content }: RulesPreviewProps) {
  if (content.kind === 'prose') {
    if (!content.text.trim()) return null
  } else if (content.kind === 'metadata' && content.rows.length === 0) {
    return null
  } else if (content.kind === 'guidance' && !content.message.trim()) {
    return null
  }

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
        {content.kind === 'metadata' ? (
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
        ) : content.kind === 'prose' ? (
          <Text>{content.text}</Text>
        ) : (
          <Text variant="caption">
            <SemanticText tone="neutral" emphasis="low" icon={<Icon name="info" size="xs" />}>
              {content.message}
            </SemanticText>
          </Text>
        )}
      </div>
    </Panel>
  )
}
