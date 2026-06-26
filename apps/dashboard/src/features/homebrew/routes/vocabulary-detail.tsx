import { useParams } from 'react-router-dom'
import { Heading, Text } from '@rpg/ui'

import { NarrowPage } from '@/components/layout/narrow-page'
import { PageHeader } from '@/components/layout/page-header'

import { HOMEBREW_VOCABULARY_SETS } from '../lib/vocabulary-set-registry'

/** Placeholder until Phase 5 vocabulary detail UI ships. */
export function VocabularyDetail() {
  const { setId = '' } = useParams<{ setId: string }>()
  const entry = HOMEBREW_VOCABULARY_SETS.find((set) => set.setId === setId)
  const label = entry?.label ?? setId

  return (
    <NarrowPage spacing="relaxed">
      <PageHeader heading={label} />
      <Text variant="muted">Vocabulary management for {label} is coming soon.</Text>
      {!entry?.enabled ? (
        <Heading variant="section" as="h3">
          Not available yet
        </Heading>
      ) : null}
    </NarrowPage>
  )
}
