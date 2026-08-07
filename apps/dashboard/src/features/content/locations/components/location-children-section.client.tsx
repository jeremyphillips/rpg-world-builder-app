'use client'

import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import type { Location } from '@rpg/contracts'
import { Heading, Text, toast } from '@rpg/ui'

import { ContentEntityCard, ContentEntityCardViewLink } from '../../lib/content-entity-card.client'
import {
  DetailOverflowMenu,
  type DetailOverflowAction,
} from '../../lib/detail/detail-overflow-menu.client'
import { LOCATION_SECTION_LABELS, type LocationChildrenViewModel } from '../lib/location-display'
import {
  applyLocationParentReplacement,
  hasLocationParentReplacementContextMismatch,
  invalidateLocationParentReplacementQueries,
} from '../lib/location-parent-replacement'
import {
  LOCATION_PARENT_MOVE_ACTION_LABELS,
  LOCATION_PARENT_REPLACEMENT_DRAWER,
} from '../lib/location-parent-replacement-surface-copy'
import { LocationParentReplacementDrawer } from './location-parent-replacement-drawer.client'

export type LocationChildrenSectionProps = {
  childrenViewModel: LocationChildrenViewModel
  headerActions?: React.ReactNode
  canManage?: boolean
  parentLocationId: string
  campaignId: string
  campaignLocations: readonly Location[]
}

export function LocationChildrenSection({
  childrenViewModel,
  headerActions,
  canManage = false,
  parentLocationId,
  campaignId,
  campaignLocations,
}: LocationChildrenSectionProps) {
  const { items, emptyText } = childrenViewModel
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [moveSubject, setMoveSubject] = React.useState<Location | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

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
        newParentLocationId,
      })
      invalidateLocationParentReplacementQueries(queryClient, campaignId)
      setMoveSubject(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section aria-labelledby="location-children-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Heading variant="group" as="h2" id="location-children-heading">
          {LOCATION_SECTION_LABELS.children}
        </Heading>
        {headerActions}
      </div>

      {items.length === 0 ? (
        <Text variant="muted">{emptyText}</Text>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => {
            const actions: DetailOverflowAction[] = canManage
              ? [
                  {
                    id: 'view',
                    label: LOCATION_PARENT_MOVE_ACTION_LABELS.viewLocation,
                    onSelect: () => navigate(item.href),
                  },
                  {
                    id: 'move',
                    label: LOCATION_PARENT_MOVE_ACTION_LABELS.moveLocation,
                    onSelect: () => openMoveDrawer(item.id),
                  },
                ]
              : []

            return (
              <li key={item.id}>
                <ContentEntityCard
                  heading={item.name}
                  href={item.href}
                  subheading={item.summaryLine}
                  headingEndSlot={
                    canManage ? (
                      <DetailOverflowMenu
                        actions={actions}
                        triggerLabel={`Actions for ${item.name}`}
                      />
                    ) : item.href ? (
                      <ContentEntityCardViewLink href={item.href} />
                    ) : undefined
                  }
                />
              </li>
            )
          })}
        </ul>
      )}

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
    </section>
  )
}
