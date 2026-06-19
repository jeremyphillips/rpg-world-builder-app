import { RichTextContent } from '@rpg/ui'

import { formatFeatureHtml } from './format-feature-html'

type FeatureItemProps = {
  feature: {
    level: number
    name: string
    description?: string
  }
}

export function FeatureItem({ feature }: FeatureItemProps) {
  const html = formatFeatureHtml(feature.level, feature.name, feature.description)
  return (
    <li>
      <RichTextContent html={html} size="sm" tone="muted" />
    </li>
  )
}
