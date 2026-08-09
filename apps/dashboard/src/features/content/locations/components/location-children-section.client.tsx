'use client'

import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  getErrorMessage,
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
  LocationStructureRowVm,
} from '../lib/location-display'
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
import type { LocationCreateIntent } from '../lib/location-create-session'
import {
  childAuthoringTypesForParentKind,
  formatLocationAuthoringTypeAddHeading,
} from '../lib/location-create-shortcuts'
import { resolveStructureChildAuthoringOptions } from '../lib/location-structure.lib'
import { LocationAddChildMenu } from './location-add-child-menu.client'
import { LocationCreateModal } from './location-create-modal.client'
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

function resolveStructureRowHeadingSuffix(row: LocationStructureRowVm): string {
  const parts = [row.item.summaryLine]
  if (row.countPhrase) {
    parts.push(row.countPhrase)
  }
  return `${LOCATION_DISPLAY_SUMMARY_SEPARATOR}${parts.join(LOCATION_DISPLAY_SUMMARY_SEPARATOR)}`
}

function resolveExpandableRowEndSlot({
  row,
  canManage,
  actions,
  onSelectAuthoringType,
}: {
  row: LocationStructureRowVm
  canManage: boolean
  actions: readonly DetailOverflowAction[]
  onSelectAuthoringType: (authoringType: LocationAuthoringType, parentLocationId: string) => void
}) {
  const canAddChild =
    canManage && row.canAddChildren && childAuthoringTypesForParentKind(row.kind).length > 0

  const addMenu = canAddChild ? (
    <LocationAddChildMenu
      appearance="icon"
      parentKind={row.kind}
      triggerLabel={`Add location to ${row.item.name}`}
      menuHeading={`Add to ${row.item.name}`}
      onSelectAuthoringType={(authoringType) => onSelectAuthoringType(authoringType, row.item.id)}
    />
  ) : null
  const overflow =
    canManage && actions.length > 0 ? (
      <DetailOverflowMenu actions={actions} triggerLabel={`Actions for ${row.item.name}`} />
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

function LocationStructurePreviewChildRows({
  rows,
  inset,
}: {
  rows: readonly LocationStructureRowVm[]
  inset: 'self' | 'parent'
}) {
  return (
    <DetailSectionRowList>
      {rows.map((child, childIndex) => (
        <DetailEntityRow
          key={child.item.id}
          heading={child.item.name}
          href={child.item.href}
          headingSuffix={resolveStructureRowHeadingSuffix(child)}
          inset={inset}
          className={detailEntityRowDisclosurePreviewRowVariants({
            edge: resolveDetailEntityRowDisclosurePreviewRowEdge(childIndex, rows.length),
          })}
        />
      ))}
    </DetailSectionRowList>
  )
}

function resolveStructureRowNestedContent({
  row,
  canManage,
  onMove,
  onView,
  onSelectAuthoringType,
  inset,
}: {
  row: LocationStructureRowVm
  canManage: boolean
  onMove: (childId: string) => void
  onView: (href: string) => void
  onSelectAuthoringType: (authoringType: LocationAuthoringType, parentLocationId: string) => void
  inset: 'self' | 'parent'
}): React.ReactNode {
  if (row.children.length === 0) return null

  if (row.disclosure) {
    return (
      <LocationStructureRows
        rows={row.children}
        canManage={canManage}
        onMove={onMove}
        onView={onView}
        onSelectAuthoringType={onSelectAuthoringType}
        inset={inset}
      />
    )
  }

  return <LocationStructurePreviewChildRows rows={row.children} inset={inset} />
}

function resolveStructureRowDisclosure(
  row: LocationStructureRowVm,
  nestedContent: React.ReactNode,
) {
  if (row.disclosure && nestedContent) {
    return {
      mode: 'expandable' as const,
      label: `locations in ${row.item.name}`,
      content: nestedContent,
    }
  }

  if (row.canAddChildren) {
    return { mode: 'reserved' as const }
  }

  return undefined
}

function resolveStructureRowEndSlot({
  row,
  canManage,
  actions,
  onSelectAuthoringType,
}: {
  row: LocationStructureRowVm
  canManage: boolean
  actions: readonly DetailOverflowAction[]
  onSelectAuthoringType: (authoringType: LocationAuthoringType, parentLocationId: string) => void
}) {
  if (row.canAddChildren) {
    return resolveExpandableRowEndSlot({
      row,
      canManage,
      actions,
      onSelectAuthoringType,
    })
  }

  if (canManage && actions.length > 0) {
    return <DetailOverflowMenu actions={actions} triggerLabel={`Actions for ${row.item.name}`} />
  }

  return undefined
}

function isStructurePreviewLeaf(row: LocationStructureRowVm): boolean {
  return !row.disclosure && row.children.length === 0 && !row.canAddChildren
}

function LocationStructureRow({
  row,
  index,
  rowCount,
  canManage,
  onMove,
  onView,
  onSelectAuthoringType,
  inset,
}: {
  row: LocationStructureRowVm
  index: number
  rowCount: number
  canManage: boolean
  onMove: (childId: string) => void
  onView: (href: string) => void
  onSelectAuthoringType: (authoringType: LocationAuthoringType, parentLocationId: string) => void
  inset: 'self' | 'parent'
}) {
  const actions = buildChildRowActions(row.item, canManage, onMove, onView)
  const previewClassName = detailEntityRowDisclosurePreviewRowVariants({
    edge: resolveDetailEntityRowDisclosurePreviewRowEdge(index, rowCount),
  })

  if (isStructurePreviewLeaf(row)) {
    return (
      <DetailEntityRow
        heading={row.item.name}
        href={row.item.href}
        headingSuffix={resolveStructureRowHeadingSuffix(row)}
        inset={inset}
        className={previewClassName}
      />
    )
  }

  const nestedContent = resolveStructureRowNestedContent({
    row,
    canManage,
    onMove,
    onView,
    onSelectAuthoringType,
    inset,
  })

  return (
    <DetailEntityRow
      heading={row.item.name}
      href={row.item.href}
      headingSuffix={resolveStructureRowHeadingSuffix(row)}
      inset={inset}
      disclosure={resolveStructureRowDisclosure(row, nestedContent)}
      endSlot={resolveStructureRowEndSlot({
        row,
        canManage,
        actions,
        onSelectAuthoringType,
      })}
      className={!row.disclosure && !row.canAddChildren ? previewClassName : undefined}
    />
  )
}

function LocationStructureRows({
  rows,
  canManage,
  onMove,
  onView,
  onSelectAuthoringType,
  inset = 'parent',
}: {
  rows: readonly LocationStructureRowVm[]
  canManage: boolean
  onMove: (childId: string) => void
  onView: (href: string) => void
  onSelectAuthoringType: (authoringType: LocationAuthoringType, parentLocationId: string) => void
  inset?: 'self' | 'parent'
}) {
  return (
    <DetailSectionRowList>
      {rows.map((row, index) => (
        <LocationStructureRow
          key={row.item.id}
          row={row}
          index={index}
          rowCount={rows.length}
          canManage={canManage}
          onMove={onMove}
          onView={onView}
          onSelectAuthoringType={onSelectAuthoringType}
          inset={inset}
        />
      ))}
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

type LocationStructureGroupsProps = {
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

function LocationStructureGroups({
  groups,
  parentKind,
  canManage,
  onSelectAuthoringType,
  onMove,
  onView,
}: LocationStructureGroupsProps) {
  const structureAuthoring = resolveStructureChildAuthoringOptions(
    parentKind,
    childAuthoringTypesForParentKind(parentKind),
  )
  const canAddStructural = Boolean(canManage && structureAuthoring.structural)
  const canAddDirectLocation = canManage && structureAuthoring.direct.length > 0

  const resolveGroupEndSlot = (group: (typeof groups)[number]) => {
    if (
      group.structuralAuthoringType &&
      canAddStructural &&
      structureAuthoring.structural === group.structuralAuthoringType
    ) {
      return (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          density="compact"
          onClick={() => onSelectAuthoringType(group.structuralAuthoringType!)}
        >
          <Plus aria-hidden />
          {formatLocationAuthoringTypeAddHeading(group.structuralAuthoringType, { parentKind })}
        </Button>
      )
    }

    if (group.id === 'directLocations' && canAddDirectLocation) {
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
        <DetailSectionGroup key={group.id} label={group.label} endSlot={resolveGroupEndSlot(group)}>
          {group.expandableItems && group.expandableItems.length > 0 ? (
            <LocationStructureRows
              rows={group.expandableItems}
              canManage={canManage}
              onMove={onMove}
              onView={onView}
              onSelectAuthoringType={onSelectAuthoringType}
              inset="parent"
            />
          ) : group.items.length === 0 ? (
            <Text variant="muted" className="pt-1 text-sm">
              {group.emptyText}
            </Text>
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
  const [createIntent, setCreateIntent] = React.useState<LocationCreateIntent | null>(null)

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
    } catch (err) {
      toast.error(getErrorMessage(err, LOCATION_PARENT_REPLACEMENT_DRAWER.submitFailedFallback))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectAuthoringType = (
    authoringType: LocationAuthoringType,
    fixedParentLocationId: string = parentLocationId,
  ) => {
    setCreateIntent({
      authoringType,
      parentLocationId: fixedParentLocationId,
      parentKind:
        fixedParentLocationId === parentLocationId
          ? parentKind
          : campaignLocations.find((location) => location.id === fixedParentLocationId)?.kind,
    })
  }

  const hasFlatContent = items.length > 0

  return (
    <>
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
          <LocationStructureGroups
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

      {createIntent ? (
        <LocationCreateModal
          open
          onOpenChange={(open) => {
            if (!open) setCreateIntent(null)
          }}
          intent={createIntent}
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
