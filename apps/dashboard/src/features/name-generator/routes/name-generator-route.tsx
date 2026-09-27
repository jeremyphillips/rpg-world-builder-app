import { Alert, Heading, Text } from '@rpg/ui'

import { PageShell } from '@/components/layout/page/page-shell'

import { NameGeneratorPage } from '../components/name-generator-page'

export function NameGeneratorRoute() {
  return (
    <PageShell width="narrow" rhythm="relaxed">
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
    </PageShell>
  )
}
