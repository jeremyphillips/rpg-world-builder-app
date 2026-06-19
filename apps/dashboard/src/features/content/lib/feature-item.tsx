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
  return (
    <li>
      <RichTextContent
        html={formatFeatureHtml(feature.level, feature.name, feature.description)}
        size="sm"
        tone="muted"
      />
    </li>
  )
}
