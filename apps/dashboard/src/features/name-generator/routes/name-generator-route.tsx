import { Alert, Heading, Text } from '@rpg/ui'

import { NarrowPage } from '@/components/layout/page/narrow-page'

import { NameGeneratorPage } from '../components/name-generator-page.client'

export function NameGeneratorRoute() {
  return (
    <NarrowPage spacing="relaxed">
      <Heading variant="page" as="h1">
        Name Generator
      </Heading>
      <Text variant="muted">Generate names from linguistic and cultural naming traditions.</Text>
      <Alert
        variant="default"
        title="Experimental feature"
        description="Naming collections and matching behavior are still being developed. Generated names may change as datasets are refined."
      />
      <NameGeneratorPage />
    </NarrowPage>
  )
}
