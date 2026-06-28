import { useParams } from 'react-router-dom'

import { RulesConfigDetailContent } from './rules-config-detail-content'

export function RulesConfigDetail() {
  const { campaignId = '', configId = '' } = useParams<{ campaignId: string; configId: string }>()
  return <RulesConfigDetailContent campaignId={campaignId} configId={configId} />
}
