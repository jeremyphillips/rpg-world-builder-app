import type { OptionPresentationFacts } from '@rpg/contracts'
import { joinInlineMetadata } from '@rpg/contracts/primitives'

import type { EntitySummaryStatusItem } from '@/features/content'

export function recommendationStatusItems(
  presentation: OptionPresentationFacts | undefined,
): EntitySummaryStatusItem[] {
  const fact = presentation?.facts.find((entry) => entry.kind === 'recommendation')
  if (!fact) return []
  const sources = formatInlineRecommendationSources(fact.sourceLabels)
  const title = sources.title ?? (sources.inline || undefined)
  return [
    {
      kind: 'badge',
      label: fact.label,
      appearance: 'outline',
      tone: 'info',
      ...(title ? { title } : {}),
    },
  ]
}

/** Up to two sources inline. Three or more keep the first source and a +N count. */
export function formatInlineRecommendationSources(labels: readonly string[]): {
  inline: string
  title?: string
} {
  if (labels.length === 0) return { inline: '' }
  if (labels.length <= 2) return { inline: joinInlineMetadata(labels) }
  return {
    inline: `${labels[0]} +${labels.length - 1}`,
    title: joinInlineMetadata(labels),
  }
}
