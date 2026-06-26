import { useParams } from 'react-router-dom'

import { VocabularyDetailContent } from './vocabulary-detail-content'

export function VocabularyDetail() {
  const { campaignId = '', setId = '' } = useParams<{ campaignId: string; setId: string }>()
  return <VocabularyDetailContent campaignId={campaignId} setId={setId} />
}
