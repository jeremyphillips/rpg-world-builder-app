import { joinInlineMetadata } from '@rpg/contracts/primitives'

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
