import { Heading, Text } from '@rpg/ui'

interface PlaceholderPageProps {
  title: string
  description: string
}

/** Temporary route shell until feature plans replace placeholders. */
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="space-y-2">
      <Heading variant="page" as="h1">
        {title}
      </Heading>
      <Text variant="muted">{description}</Text>
    </div>
  )
}
