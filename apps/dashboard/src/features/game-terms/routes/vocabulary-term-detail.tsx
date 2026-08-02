import { useParams } from 'react-router-dom'

import { VocabularyTermDetailContent } from './vocabulary-term-detail-content'

export function VocabularyTermDetail() {
  const {
    campaignId = '',
    setId = '',
    termId = '',
  } = useParams<{
    campaignId: string
    setId: string
    termId: string
  }>()

  return <VocabularyTermDetailContent campaignId={campaignId} setId={setId} termId={termId} />
}
