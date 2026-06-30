import { Heading, RichTextContent } from '@rpg/ui'

type FeatureItemProps = {
  feature: {
    level: number
    name: string
    description?: string
  }
}

function featureHeading(level: number, name: string): string {
  return `Level ${level}: ${name}`
}

function hasFeatureDescription(description: string | undefined): description is string {
  return description !== undefined && description.trim() !== ''
}

export function FeatureItem({ feature }: FeatureItemProps) {
  const heading = featureHeading(feature.level, feature.name)

  return (
    <li className="space-y-2">
      <Heading variant="label" as="h3">
        {heading}
      </Heading>
      {hasFeatureDescription(feature.description) && (
        <RichTextContent html={feature.description} size="md" tone="muted" />
      )}
    </li>
  )
}
