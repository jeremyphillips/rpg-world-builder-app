import type { ReactNode } from 'react'
import { Text } from '@rpg/ui'

import { useCanManageCampaign } from '@/features/campaign'

interface ContentAuthoringGateProps {
  campaignId: string
  children: ReactNode
}

/** Renders children only when the user can author campaign content (owner/co-owner). */
export function ContentAuthoringGate({ campaignId, children }: ContentAuthoringGateProps) {
  const canManage = useCanManageCampaign(campaignId)

  if (!canManage) {
    return (
      <Text variant="destructive" role="alert">
        You do not have permission to edit campaign content.
      </Text>
    )
  }

  return children
}
