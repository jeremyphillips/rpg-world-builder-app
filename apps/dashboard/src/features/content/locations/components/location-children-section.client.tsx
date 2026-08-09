'use client'

import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  LOCATION_DISPLAY_SUMMARY_SEPARATOR,
  type Location,
  type LocationKind,
} from '@rpg/contracts'
import { Button, Text, toast } from '@rpg/ui'
import { Plus } from 'lucide-react'

import { DetailEntityRow } from '../../lib/detail/detail-entity-row.client'
import { DetailEntityRowActions } from '../../lib/detail/detail-entity-row-actions.client'
import {
  detailEntityRowDisclosurePreviewRowVariants,
  resolveDetailEntityRowDisclosurePreviewRowEdge,
} from '../../lib/detail/detail-entity-row.variants'
import { DetailSectionGroup } from '../../lib/detail/detail-section-group.client'
import { DetailSectionPanel } from '../../lib/detail/detail-section-panel.client'
import { DetailSectionRowList } from '../../lib/detail/detail-section-row-list.client'
import {
  DetailOverflowMenu,
  type DetailOverflowAction,
} from '../../lib/detail/detail-overflow-menu.client'
import type {
  LocationChildItem,
  LocationChildrenViewModel,
  SettlementStructureDistrictItem,
} from '../lib/location-display'
import { formatLocationChildCount } from '../lib/location-display'
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
import {
  childAuthoringTypesForParentKind,
  formatLocationAuthoringTypeAddHeading,
} from '../lib/location-create-shortcuts'
import { resolveSettlementStructureChildAuthoringOptions } from '../lib/location-settlement-structure.lib'
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

function buildChildRowActions(
  item: LocationChildItem,
  canManage: boolean,
  onMove: (childId: string) => void,
  onView: (href: string) => void,
): DetailOverflowAction[] {
  return canManage
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
}

function LocationPreviewChildRows({
  items,
  inset = 'parent',
}: {
  items: LocationChildItem[]
  inset?: 'self' | 'parent'
}) {
  return (
    <DetailSectionRowList>
      {items.map((item, index) => (
        <DetailEntityRow
          key={item.id}
          heading={item.name}
          href={item.href}
          headingSuffix={`${LOCATION_DISPLAY_SUMMARY_SEPARATOR}${item.summaryLine}`}
          inset={inset}
          className={detailEntityRowDisclosurePreviewRowVariants({
            edge: resolveDetailEntityRowDisclosurePreviewRowEdge(index, items.length),
          })}
        />
      ))}
    </DetailSectionRowList>
  )
}

function resolveDistrictRowEndSlot({
  item,
  canManage,
  canAddChild,
  actions,
  onSelectAuthoringType,
}: {
  item: LocationChildItem
  canManage: boolean
  canAddChild: boolean
  actions: readonly DetailOverflowAction[]
  onSelectAuthoringType: (authoringType: LocationAuthoringType, parentLocationId: string) => void
}) {
  const addMenu = canAddChild ? (
    <LocationAddChildMenu
      appearance="icon"
      parentKind="district"
      triggerLabel={`Add location to ${item.name}`}
      menuHeading={`Add to ${item.name}`}
      onSelectAuthoringType={(authoringType) => onSelectAuthoringType(authoringType, item.id)}
    />
  ) : null
  const overflow =
    canManage && actions.length > 0 ? (
      <DetailOverflowMenu actions={actions} triggerLabel={`Actions for ${item.name}`} />
    ) : null

  if (addMenu && overflow) {
    return (
      <DetailEntityRowActions>
        {addMenu}
        {overflow}
      </DetailEntityRowActions>
    )
  }

  return addMenu ?? overflow ?? undefined
}

function SettlementDistrictRows({
  items,
  canManage,
  onMove,
  onView,
  onSelectAuthoringType,
  inset = 'parent',
}: {
  items: SettlementStructureDistrictItem[]
  canManage: boolean
  onMove: (childId: string) => void
  onView: (href: string) => void
  onSelectAuthoringType: (authoringType: LocationAuthoringType, parentLocationId: string) => void
  inset?: 'self' | 'parent'
}) {
  const canAddChild = canManage && childAuthoringTypesForParentKind('district').length > 0

  return (
    <DetailSectionRowList>
      {items.map(({ item, immediateChildren }) => {
        const childCount = immediateChildren.length
        const countPhrase = formatLocationChildCount(childCount)
        const headingSuffix = `${LOCATION_DISPLAY_SUMMARY_SEPARATOR}${item.summaryLine}${LOCATION_DISPLAY_SUMMARY_SEPARATOR}${countPhrase}`
        const actions = buildChildRowActions(item, canManage, onMove, onView)

        return (
          <DetailEntityRow
            key={item.id}
            heading={item.name}
            href={item.href}
            headingSuffix={headingSuffix}
            inset={inset}
            disclosure={
              childCount > 0
                ? {
                    mode: 'expandable',
                    label: `locations in ${item.name}`,
                    content: <LocationPreviewChildRows items={immediateChildren} inset={inset} />,
                  }
                : { mode: 'reserved' }
            }
            endSlot={resolveDistrictRowEndSlot({
              item,
              canManage,
              canAddChild,
              actions,
              onSelectAuthoringType,
            })}
          />
        )
      })}
    </DetailSectionRowList>
  )
}

function LocationChildRows({
  items,
  canManage,
  onMove,
  onView,
  inset = 'self',
}: {
  items: LocationChildrenViewModel['items']
  canManage: boolean
  onMove: (childId: string) => void
  onView: (href: string) => void
  inset?: 'self' | 'parent'
}) {
  return (
    <DetailSectionRowList>
      {items.map((item) => {
        const actions = buildChildRowActions(item, canManage, onMove, onView)

        return (
          <DetailEntityRow
            key={item.id}
            heading={item.name}
            href={item.href}
            headingSuffix={`${LOCATION_DISPLAY_SUMMARY_SEPARATOR}${item.summaryLine}`}
            inset={inset}
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

type SettlementStructureGroupsProps = {
  groups: NonNullable<LocationChildrenViewModel['groups']>
  parentKind: LocationKind
  canManage: boolean
  onSelectAuthoringType: (
    authoringType: LocationAuthoringType,
    fixedParentLocationId?: string,
  ) => void
  onMove: (childId: string) => void
  onView: (href: string) => void
}

function SettlementStructureGroups({
  groups,
  parentKind,
  canManage,
  onSelectAuthoringType,
  onMove,
  onView,
}: SettlementStructureGroupsProps) {
  const structureAuthoring = resolveSettlementStructureChildAuthoringOptions(
    childAuthoringTypesForParentKind(parentKind),
  )
  const canAddDistrict = Boolean(canManage && structureAuthoring.district)
  const canAddDirectLocation = canManage && structureAuthoring.direct.length > 0

  const resolveGroupEndSlot = (groupId: string) => {
    if (groupId === 'districts' && canAddDistrict) {
      return (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          density="compact"
          onClick={() => onSelectAuthoringType('district')}
        >
          <Plus aria-hidden />
          {formatLocationAuthoringTypeAddHeading('district')}
        </Button>
      )
    }

    if (groupId === 'directPlaces' && canAddDirectLocation) {
      return (
        <LocationAddChildMenu
          appearance="group"
          parentKind={parentKind}
          allowedAuthoringTypes={structureAuthoring.direct}
          onSelectAuthoringType={onSelectAuthoringType}
        />
      )
    }

    return undefined
  }

  return (
    <>
      {groups.map((group) => (
        <DetailSectionGroup
          key={group.id}
          label={group.label}
          endSlot={resolveGroupEndSlot(group.id)}
        >
          {group.items.length === 0 ? (
            <Text variant="muted" className="pt-1 text-sm">
              {group.emptyText}
            </Text>
          ) : group.id === 'districts' ? (
            <SettlementDistrictRows
              items={group.items}
              canManage={canManage}
              onMove={onMove}
              onView={onView}
              onSelectAuthoringType={onSelectAuthoringType}
              inset="parent"
            />
          ) : (
            <LocationChildRows
              items={group.items}
              canManage={canManage}
              onMove={onMove}
              onView={onView}
              inset="parent"
            />
          )}
        </DetailSectionGroup>
      ))}
    </>
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

  const handleSelectAuthoringType = (
    authoringType: LocationAuthoringType,
    fixedParentLocationId: string = parentLocationId,
  ) => {
    launch({ authoringType, parentLocationId: fixedParentLocationId })
  }

  const hasFlatContent = items.length > 0

  return (
    <>
      {setupHost}
      <DetailSectionPanel
        heading={heading}
        headingId="location-children-heading"
        helper={helper}
        headerEndSlot={
          !groups && canManage ? (
            <LocationAddChildMenu
              parentKind={parentKind}
              onSelectAuthoringType={handleSelectAuthoringType}
            />
          ) : undefined
        }
      >
        {groups ? (
          <SettlementStructureGroups
            groups={groups}
            parentKind={parentKind}
            canManage={canManage}
            onSelectAuthoringType={handleSelectAuthoringType}
            onMove={openMoveDrawer}
            onView={(href) => navigate(href)}
          />
        ) : !hasFlatContent ? (
          <Text variant="muted" className="px-4 pb-2 pt-1 text-sm">
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
