import { Heading, Text } from '@rpg/ui'

import { NarrowPage } from '@/components/layout/narrow-page'

export function NameGeneratorRoute() {
  return (
    <NarrowPage>
      <Heading variant="page" as="h1">
        Name Generator
      </Heading>
      <Text variant="muted">Generate names from linguistic and cultural naming traditions.</Text>
    </NarrowPage>
  )
}
