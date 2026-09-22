import { useMemo, useState } from 'react'

import {
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterRelationshipDraftEdges,
} from '@rpg/contracts'

import { useCampaignCharacters } from '@/features/campaign'
import { useNpcs } from '@/features/character'
import { useLocations } from '@/features/content'

import { CONNECTION_TOP_LEVEL_SECTION_IDS } from '../../../../lib/relationship/connection-section-catalog'
import { buildConnectionsStepData } from '../../../../lib/relationship/connections-step-data.lib'
import type { ConnectionsStepActiveDrawer } from '../../../../lib/relationship/connections-step-panels.lib'

import { ConnectionsStepDrawers } from './connections-step-drawers'
import { ConnectionsStepSection } from './connections-step-section'

export type ConnectionsStepPanelsProps = {
  context: CharacterBuildContext
  relationshipEdges: CharacterRelationshipDraftEdges
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}

export function ConnectionsStepPanels({
  context,
  relationshipEdges,
  onDraftChange,
}: ConnectionsStepPanelsProps) {
  const campaignId =
    context.rulesScope.type === 'campaign' ? context.rulesScope.campaignId : undefined
  const charactersQuery = useCampaignCharacters(campaignId)
  const npcsQuery = useNpcs(campaignId)
  const locationsQuery = useLocations(campaignId)
  const stepData = useMemo(
    () =>
      buildConnectionsStepData({
        buildContext: context,
        campaignCharacters: charactersQuery.data ?? [],
        campaignNpcs: npcsQuery.data ?? [],
        locations: locationsQuery.data,
        locationsPending: locationsQuery.isPending,
        locationsError: locationsQuery.error,
        locationsHasData: locationsQuery.data !== undefined,
      }),
    [
      charactersQuery.data,
      context,
      locationsQuery.data,
      locationsQuery.error,
      locationsQuery.isPending,
      npcsQuery.data,
    ],
  )

  const [activeDrawer, setActiveDrawer] = useState<ConnectionsStepActiveDrawer>(null)
  const [editingMembershipEdgeId, setEditingMembershipEdgeId] = useState<string | null>(null)

  const updateEdges = (nextEdges: CharacterRelationshipDraftEdges) => {
    onDraftChange({ relationshipEdges: nextEdges })
  }

  return (
    <div className="flex flex-col gap-4">
      {CONNECTION_TOP_LEVEL_SECTION_IDS.map((sectionId) => (
        <ConnectionsStepSection
          key={sectionId}
          sectionId={sectionId}
          relationshipEdges={relationshipEdges}
          stepData={stepData}
          campaignId={campaignId}
          onOpenDrawer={setActiveDrawer}
          onEditMembership={setEditingMembershipEdgeId}
          onRemoveEdge={updateEdges}
        />
      ))}

      <ConnectionsStepDrawers
        activeDrawer={activeDrawer}
        onActiveDrawerChange={setActiveDrawer}
        editingMembershipEdgeId={editingMembershipEdgeId}
        onEditingMembershipEdgeIdChange={setEditingMembershipEdgeId}
        relationshipEdges={relationshipEdges}
        stepData={stepData}
        onUpdateEdges={updateEdges}
      />
    </div>
  )
}
