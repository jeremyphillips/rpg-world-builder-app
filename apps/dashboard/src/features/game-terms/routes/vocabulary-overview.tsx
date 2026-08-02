import { useParams } from 'react-router-dom'

import { VocabularyOverviewContent } from './vocabulary-overview-content'

export function VocabularyOverview() {
  const { campaignId = '', setId = '' } = useParams<{ campaignId: string; setId: string }>()
  return <VocabularyOverviewContent campaignId={campaignId} setId={setId} />
}
