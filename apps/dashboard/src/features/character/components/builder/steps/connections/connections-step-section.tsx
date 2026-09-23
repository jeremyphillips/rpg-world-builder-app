import { useNavigate } from 'react-router-dom'
import { Eye, Pencil, Trash2 } from 'lucide-react'

import type {
  CharacterRelationshipDraftEdge,
  CharacterRelationshipDraftEdges,
} from '@rpg/contracts'
import { IconContainer, SplitButton } from '@rpg/ui'
import { cn } from '@rpg/ui'

import {
  DetailCollectionPanel,
  RelationshipList,
  detailCollectionRecordSeparatorVariants,
  type DetailOverflowAction,
} from '@/features/content'

import {
  CONNECTION_SECTION_CATALOG,
  filterDraftEdgesBySection,
  type ConnectionTopLevelSectionId,
} from '../../../../lib/relationship/connection-section-catalog'
import { getConnectionSectionIcon } from '../../../../lib/relationship/connection-section-icons'
import {
  draftEdgeHasEditableDetails,
  removeDraftEdgeById,
} from '../../../../lib/relationship/connection-draft-edges.lib'
import {
  resolveConnectionRowPresentation,
  resolveUnavailableEntityLabel,
} from '../../../../lib/relationship/connection-row-presentation.lib'
import type { ConnectionsStepData } from '../../../../lib/relationship/connections-step-panels.lib'
import {
  resolveConnectionsStepSectionAddAction,
  resolveConnectionsStepSectionEmptyLabel,
  type ConnectionsStepActiveDrawer,
} from '../../../../lib/relationship/connections-step-panels.lib'

export type ConnectionsStepSectionProps = {
  sectionId: ConnectionTopLevelSectionId
  relationshipEdges: CharacterRelationshipDraftEdges
  stepData: ConnectionsStepData
  campaignId?: string
  onOpenDrawer: (drawer: ConnectionsStepActiveDrawer) => void
  onEditEdge: (edgeId: string) => void
  onRemoveEdge: (nextEdges: CharacterRelationshipDraftEdges) => void
}

function buildConnectionOverflowActions(input: {
  edge: CharacterRelationshipDraftEdge
  presentation: ReturnType<typeof resolveConnectionRowPresentation>
  relationshipEdges: CharacterRelationshipDraftEdges
  navigate: ReturnType<typeof useNavigate>
  onEditEdge: (edgeId: string) => void
  onRemoveEdge: (nextEdges: CharacterRelationshipDraftEdges) => void
}): DetailOverflowAction[] {
  const editActions: DetailOverflowAction[] = draftEdgeHasEditableDetails(input.edge.kind)
    ? [
        {
          id: 'edit',
          label: 'Edit relationship',
          icon: <Pencil aria-hidden />,
          onSelect: () => input.onEditEdge(input.edge.id),
        },
      ]
    : []

  return [
    ...editActions,
    {
      id: 'view',
      label: 'View connected record',
      icon: <Eye aria-hidden />,
      disabled: !input.presentation.canViewRecord,
      onSelect: () => {
        if (input.presentation.headingHref) {
          input.navigate(input.presentation.headingHref)
        }
      },
    },
    {
      id: 'remove',
      label: 'Remove connection',
      icon: <Trash2 aria-hidden />,
      destructive: true,
      separatorBefore: true,
      onSelect: () =>
        input.onRemoveEdge(removeDraftEdgeById(input.relationshipEdges, input.edge.id)),
    },
  ]
}

export function ConnectionsStepSection({
  sectionId,
  relationshipEdges,
  stepData,
  campaignId,
  onOpenDrawer,
  onEditEdge,
  onRemoveEdge,
}: ConnectionsStepSectionProps) {
  const navigate = useNavigate()
  const section = CONNECTION_SECTION_CATALOG[sectionId]
  const sectionEdges = filterDraftEdgesBySection(relationshipEdges, sectionId)
  const SectionIcon = getConnectionSectionIcon(sectionId)
  const locationsReady = stepData.locationsQueryStatus.status === 'success'

  const addAction = resolveConnectionsStepSectionAddAction({
    sectionId,
    campaignId,
    locationsReady,
    openDrawer: onOpenDrawer,
  })

  const emptyLabel = resolveConnectionsStepSectionEmptyLabel(sectionId, campaignId)

  return (
    <DetailCollectionPanel
      heading={section.heading}
      headingId={`connections-${sectionId}`}
      helper={section.description}
      headerAlign="center"
      headerSurface="subtle"
      bodySurface="transparent"
      icon={
        <IconContainer size="sm">
          <SectionIcon className="size-4" aria-hidden />
        </IconContainer>
      }
      action={
        <SplitButton
          label={addAction.label}
          onPrimaryClick={addAction.onPrimaryClick}
          menuGroups={addAction.menuGroups}
          disabled={addAction.disabled}
        />
      }
    >
      <RelationshipList.Root itemCount={sectionEdges.length} emptyLabel={emptyLabel}>
        {sectionEdges.length > 0 ? (
          <ul className={cn(detailCollectionRecordSeparatorVariants(), 'px-4')}>
            {sectionEdges.map((edge) => {
              const presentation = resolveConnectionRowPresentation({
                edge,
                campaignId: stepData.campaignId,
                organizationsById: stepData.organizationsById,
                locationsById: stepData.locationsById,
                charactersById: stepData.charactersById,
              })
              const unavailableLabel = resolveUnavailableEntityLabel(
                edge,
                stepData.organizationsById,
                stepData.locationsById,
                stepData.charactersById,
              )

              const actions = buildConnectionOverflowActions({
                edge,
                presentation,
                relationshipEdges,
                navigate,
                onEditEdge,
                onRemoveEdge,
              })

              return (
                <RelationshipList.Row
                  key={edge.id}
                  title={presentation.heading}
                  href={presentation.headingHref}
                  description={unavailableLabel ?? presentation.description ?? undefined}
                  menu={{
                    label: `Actions for ${presentation.heading}`,
                    items: actions,
                  }}
                  overflowTriggerIcon="vertical"
                />
              )
            })}
          </ul>
        ) : null}
      </RelationshipList.Root>
    </DetailCollectionPanel>
  )
}
