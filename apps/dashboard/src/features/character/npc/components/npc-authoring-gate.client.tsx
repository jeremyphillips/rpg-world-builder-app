'use client'

import type { ReactNode } from 'react'
import { Text } from '@rpg/ui'

import { useCanManageCampaign } from '@/features/campaign'

const NPC_AUTHORING_DENIED_MESSAGE =
  'You do not have permission to manage campaign NPCs. Only campaign owners and co-owners can access this area.'

type NpcAuthoringGateProps = {
  campaignId: string
  children: ReactNode
}

/** Renders children only when the user can author campaign NPCs (owner/co-owner). */
export function NpcAuthoringGate({ campaignId, children }: NpcAuthoringGateProps) {
  const canManage = useCanManageCampaign(campaignId)

  if (!canManage) {
    return (
      <Text variant="destructive" role="alert">
        {NPC_AUTHORING_DENIED_MESSAGE}
      </Text>
    )
  }

  return children
}
