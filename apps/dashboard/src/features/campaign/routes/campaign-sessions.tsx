import { Heading, Text } from '@rpg/ui'

import { PageShell } from '@/components/layout/page/page-shell'

export function CampaignSessions() {
  return (
    <PageShell width="narrow">
      <Heading variant="page" as="h1">
        Sessions
      </Heading>
      <Text variant="muted">Coming soon.</Text>
    </PageShell>
  )
}
