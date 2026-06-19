import { Heading, RichTextContent } from '@rpg/ui'

import { formatFeatureDescriptionHtml } from './format-feature-description-html'

type FeatureItemProps = {
  feature: {
    level: number
    name: string
    description?: string
  }
}

export function FeatureItem({ feature }: FeatureItemProps) {
  const bodyHtml = formatFeatureDescriptionHtml(feature.description)

  return (
    <li className="space-y-1">
      <Heading variant="label" as="h3">
        Level {feature.level}: {feature.name}
      </Heading>
      {bodyHtml && <RichTextContent html={bodyHtml} size="sm" tone="muted" />}
    </li>
  )
}
