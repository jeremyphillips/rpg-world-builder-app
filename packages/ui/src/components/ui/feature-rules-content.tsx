import type { StatBlockProseDocument } from '@rpg/contracts'

import { RichTextContent } from './rich-text-content'
import { Icon } from './icon/icon'
import { SemanticText } from './semantic-text/semantic-text'
import { StatBlockProseView } from './stat-block-prose'
import { Text } from './text'

export type FeatureRulesContentProps = {
  introHtml?: string
  rulesDocument?: StatBlockProseDocument
  guidance?: string
  /** Rich-text props for authored introduction — matches content-detail prose. */
  introTone?: 'default' | 'muted'
}

function hasIntro(introHtml: string | undefined): boolean {
  return Boolean(introHtml?.trim())
}

/** Authored introduction followed by generated stat-block rules (shared detail + preview body). */
export function FeatureRulesContent({
  introHtml,
  rulesDocument,
  guidance,
  introTone = 'muted',
}: FeatureRulesContentProps) {
  const hasRules = Boolean(rulesDocument?.length)
  const showGuidance = Boolean(guidance?.trim()) && !hasRules

  if (!hasIntro(introHtml) && !hasRules && !showGuidance) return null

  return (
    <div className="feature-rules-content flex flex-col gap-1">
      {hasIntro(introHtml) ? (
        <RichTextContent html={introHtml!} size="sm" tone={introTone} />
      ) : null}
      {hasRules ? <StatBlockProseView document={rulesDocument!} /> : null}
      {showGuidance ? (
        <Text variant="caption">
          <SemanticText tone="neutral" emphasis="low" icon={<Icon name="info" size="xs" />}>
            {guidance}
          </SemanticText>
        </Text>
      ) : null}
    </div>
  )
}
