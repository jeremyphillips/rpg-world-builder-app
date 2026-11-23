import type { StatBlockProseDocument } from '@rpg/contracts'

import { EmphasisDetailLine } from './emphasis-detail-line'
import { FeatureRulesContent } from './feature-rules-content'
import { Eyebrow } from './eyebrow'
import { RichTextContent } from './rich-text-content'
import { Icon } from './icon/icon'
import { MetadataList } from './metadata-list'
import { Panel } from './panel'
import { SemanticText } from './semantic-text/semantic-text'
import { StatBlockProseView } from './stat-block-prose'
import { Text } from './text'

export type RulesPreviewMetadataRow = {
  id: string
  label: string
  primary: string
  secondary?: string
}

export const RULES_PREVIEW_DEFAULT_LABEL = 'Preview' as const

export type RulesPreviewContent =
  | { kind: 'metadata'; rows: readonly RulesPreviewMetadataRow[] }
  | { kind: 'prose'; text: string }
  | { kind: 'html'; html: string }
  | { kind: 'rules'; document: StatBlockProseDocument }
  | {
      kind: 'introAndRules'
      introHtml?: string
      rulesDocument?: StatBlockProseDocument
      guidance?: string
    }
  | { kind: 'guidance'; message: string }

export type RulesPreviewProps = {
  label?: string
  /** Qualified stat-block heading between the eyebrow and body. */
  title?: string
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
    case 'rules':
      return content.document.length > 0
    case 'introAndRules': {
      const intro = Boolean(content.introHtml?.trim())
      const rules = Boolean(content.rulesDocument?.length)
      const guidance = Boolean(content.guidance?.trim()) && !rules
      return intro || rules || guidance
    }
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
  if (content.kind === 'rules') return <StatBlockProseView document={content.document} />
  if (content.kind === 'introAndRules') {
    return (
      <FeatureRulesContent
        introHtml={content.introHtml}
        rulesDocument={content.rulesDocument}
        guidance={content.guidance}
      />
    )
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
export function RulesPreview({
  label = RULES_PREVIEW_DEFAULT_LABEL,
  title,
  context,
  content,
}: RulesPreviewProps) {
  if (!rulesPreviewHasContent(content)) return null

  return (
    <Panel tone="subtle" density="compact">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <Eyebrow size="sm">{label}</Eyebrow>
        {context ? (
          <Text as="span" variant="supporting">
            {context}
          </Text>
        ) : null}
      </div>
      {title ? (
        <Text variant="emphasis" className="mb-0.5">
          {title}
        </Text>
      ) : null}
      <div className="flex flex-col gap-1">
        <RulesPreviewBody content={content} />
      </div>
    </Panel>
  )
}
