'use client'

import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  LOCATION_DISPLAY_SUMMARY_SEPARATOR,
  type Location,
  type LocationKind,
} from '@rpg/contracts'
import { Text, toast } from '@rpg/ui'

import { DetailEntityRow } from '../../lib/detail/detail-entity-row.client'
import { DetailSectionPanel } from '../../lib/detail/detail-section-panel.client'
import { DetailSectionRowList } from '../../lib/detail/detail-section-row-list.client'
import {
  DetailOverflowMenu,
  type DetailOverflowAction,
} from '../../lib/detail/detail-overflow-menu.client'
import type { LocationChildrenViewModel } from '../lib/location-display'
import type { LocationAuthoringType } from '../lib/location-authoring-type'
import {
  applyLocationParentReplacement,
  hasLocationParentReplacementContextMismatch,
  invalidateLocationParentReplacementQueries,
} from '../lib/location-parent-replacement'
import {
  LOCATION_PARENT_MOVE_ACTION_LABELS,
  LOCATION_PARENT_REPLACEMENT_DRAWER,
} from '../lib/location-parent-replacement-surface-copy'
import type { LocationFixedCreateContext } from '../lib/location-form-ctx'
import { LocationAddChildMenu } from './location-add-child-menu.client'
import { useLocationCreateSessionLaunch } from './location-create-launcher.client'
import { LocationContainedCreateDrawer } from './location-contained-create-drawer.client'
import { LocationParentReplacementDrawer } from './location-parent-replacement-drawer.client'

export type LocationChildrenSectionProps = {
  childrenViewModel: LocationChildrenViewModel
  canManage?: boolean
  parentLocationId: string
  parentKind: LocationKind
  campaignId: string
  campaignLocations: readonly Location[]
}

function LocationChildRows({
  items,
  canManage,
  onMove,
  onView,
}: {
  items: LocationChildrenViewModel['items']
  canManage: boolean
  onMove: (childId: string) => void
  onView: (href: string) => void
}) {
  return (
    <DetailSectionRowList>
      {items.map((item) => {
        const actions: DetailOverflowAction[] = canManage
          ? [
              {
                id: 'view',
                label: LOCATION_PARENT_MOVE_ACTION_LABELS.viewLocation,
                onSelect: () => onView(item.href),
              },
              {
                id: 'move',
                label: LOCATION_PARENT_MOVE_ACTION_LABELS.moveLocation,
                onSelect: () => onMove(item.id),
              },
            ]
          : []

        return (
          <DetailEntityRow
            key={item.id}
            heading={item.name}
            href={item.href}
            headingSuffix={`${LOCATION_DISPLAY_SUMMARY_SEPARATOR}${item.summaryLine}`}
            endSlot={
              canManage ? (
                <DetailOverflowMenu actions={actions} triggerLabel={`Actions for ${item.name}`} />
              ) : undefined
            }
          />
        )
      })}
    </DetailSectionRowList>
  )
}

export function LocationChildrenSection({
  childrenViewModel,
  canManage = false,
  parentLocationId,
  parentKind,
  campaignId,
  campaignLocations,
}: LocationChildrenSectionProps) {
  const { heading, helper, items, groups, emptyText } = childrenViewModel
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [moveSubject, setMoveSubject] = React.useState<Location | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [createFixedContext, setCreateFixedContext] =
    React.useState<LocationFixedCreateContext | null>(null)

  const { launch, setupHost } = useLocationCreateSessionLaunch(setCreateFixedContext)

  const refreshContainedLocations = React.useCallback(() => {
    invalidateLocationParentReplacementQueries(queryClient, campaignId)
    toast.warning(LOCATION_PARENT_REPLACEMENT_DRAWER.mismatchToast)
  }, [campaignId, queryClient])

  const openMoveDrawer = (childId: string) => {
    const subject = campaignLocations.find((location) => location.id === childId)
    if (!subject) {
      refreshContainedLocations()
      return
    }

    if (
      hasLocationParentReplacementContextMismatch({
        subject,
        expectedParentLocationId: parentLocationId,
      })
    ) {
      refreshContainedLocations()
      return
    }

    setMoveSubject(subject)
  }

  const handleMoveSubmit = async (newParentLocationId: string) => {
    if (!moveSubject) return

    const latestSubject = campaignLocations.find((location) => location.id === moveSubject.id)
    if (
      !latestSubject ||
      hasLocationParentReplacementContextMismatch({
        subject: latestSubject,
        expectedParentLocationId: parentLocationId,
      })
    ) {
      refreshContainedLocations()
      setMoveSubject(null)
      return
    }

    setIsSubmitting(true)
    try {
      await applyLocationParentReplacement({
        campaignId,
        subjectId: latestSubject.id,
        subjectKind: latestSubject.kind,
        newParentLocationId,
      })
      invalidateLocationParentReplacementQueries(queryClient, campaignId)
      setMoveSubject(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectAuthoringType = (authoringType: LocationAuthoringType) => {
    launch({ authoringType, parentLocationId })
  }

  const hasGroupedContent = groups?.some((group) => group.items.length > 0) ?? false
  const hasFlatContent = items.length > 0

  return (
    <>
      {setupHost}
      <DetailSectionPanel
        heading={heading}
        headingId="location-children-heading"
        helper={helper}
        headerEndSlot={
          canManage ? (
            <LocationAddChildMenu
              parentKind={parentKind}
              onSelectAuthoringType={handleSelectAuthoringType}
            />
          ) : undefined
        }
      >
        {groups ? (
          <div className="space-y-6">
            {!hasGroupedContent && !hasFlatContent ? (
              <Text variant="muted" className="px-4 py-2">
                {emptyText}
              </Text>
            ) : null}
            {groups.map((group) => (
              <div key={group.id} className="space-y-2">
                <Text variant="emphasis" className="px-4">
                  {group.label}
                </Text>
                {group.items.length === 0 ? (
                  <Text variant="muted" className="px-4 py-2">
                    {group.emptyText}
                  </Text>
                ) : (
                  <LocationChildRows
                    items={group.items}
                    canManage={canManage}
                    onMove={openMoveDrawer}
                    onView={(href) => navigate(href)}
                  />
                )}
              </div>
            ))}
          </div>
        ) : !hasFlatContent ? (
          <Text variant="muted" className="px-4 py-2">
            {emptyText}
          </Text>
        ) : (
          <LocationChildRows
            items={items}
            canManage={canManage}
            onMove={openMoveDrawer}
            onView={(href) => navigate(href)}
          />
        )}
      </DetailSectionPanel>

      {createFixedContext ? (
        <LocationContainedCreateDrawer
          open
          onOpenChange={(open) => {
            if (!open) setCreateFixedContext(null)
          }}
          fixedCreate={createFixedContext}
          campaignId={campaignId}
        />
      ) : null}

      {moveSubject ? (
        <LocationParentReplacementDrawer
          open
          onOpenChange={(open) => {
            if (!open) setMoveSubject(null)
          }}
          subject={moveSubject}
          campaignLocations={campaignLocations}
          surface="move"
          expectedParentLocationId={parentLocationId}
          isSubmitting={isSubmitting}
          onSubmit={handleMoveSubmit}
        />
      ) : null}
    </>
  )
}
