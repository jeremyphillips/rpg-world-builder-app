'use client'

import * as React from 'react'

import { resolveOrganizationMembershipMetadata } from '@rpg/contracts'
import { Button, Text } from '@rpg/ui'

import {
  CatalogPickerMetadataRenderer,
  CatalogPickerSelectionActions,
  formatCharacterInlineSummary,
  ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
  OrganizationMembershipTitleField,
  titleFromMembershipRadioValue,
  type QuickNpcCreateFormOrganization,
} from '@/features/character'

import { CatalogEntityPickerSheet, CatalogEntityRow } from '../../../lib/content-entity-card.client'

import {
  buildConnectedPartyCharacterEntitySummary,
  buildConnectedPartyCharacterPickerSearchText,
  type LocationConnectedPartyCharacterOption,
} from '../../../locations/lib/connected-parties/location-connected-party-character-options.lib'
import {
  filterAndSortOrganizationMemberPickerCandidates,
  formatOrganizationMemberPickerStatusBadgeLabel,
  ORGANIZATION_MEMBER_PICKER_ALREADY_MEMBER_LABEL,
  ORGANIZATION_MEMBER_PICKER_RECOMMENDED_LABEL,
  type OrganizationMemberSelectionPolicy,
} from '../../lib/members/organization-member-picker-drawer.lib'
import { ORGANIZATION_MEMBER_ADD_FAILED } from '../../lib/members/organization-members.constants'

export { ORGANIZATION_MEMBER_PICKER_ALREADY_MEMBER_LABEL }

export const ORGANIZATION_MEMBER_PICKER_TITLE = 'Add member'
export const ORGANIZATION_MEMBER_PICKER_SUBMIT_LABEL = 'Add member'
export const ORGANIZATION_MEMBER_PICKER_SEARCH_PLACEHOLDER = 'Search characters'
export const ORGANIZATION_MEMBER_PICKER_NO_RESULTS_MESSAGE = 'No characters match this search.'
export const ORGANIZATION_MEMBER_PICKER_NO_ITEMS_MESSAGE = 'No characters are available.'
export const ORGANIZATION_MEMBER_PICKER_CREATE_NPC_LABEL = 'Create new NPC'
export const ORGANIZATION_MEMBER_PICKER_CREATE_NPC_UNAVAILABLE_MESSAGE =
  'Quick NPC creation is unavailable — campaign build data failed to load.'

/** Campaign PC/NPC option plus whether the character already holds a membership here. */
export type OrganizationMemberPickerCandidate = LocationConnectedPartyCharacterOption & {
  isMember: boolean
  /** Existing membership title when isMember is true. */
  membershipTitle?: string
  /** True when the character matches stored org class or species affinities intersected with availability. */
  isRecommended?: boolean
}

export type OrganizationMemberPickerCommit = {
  characterId: string
  characterType: 'pc' | 'npc'
  title?: string
  priority?: number
}

export type OrganizationMemberPickerQuickNpc = {
  /** Enables the "Create new NPC" entry action. */
  enabled: boolean
  /** True when the build context failed to load — replaces the entry action with a hint. */
  buildContextFailed?: boolean
  /** Null while the campaign build context loads — the entry action stays disabled. */
  buildContextReady: boolean
}

export type OrganizationMemberPickerDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization: QuickNpcCreateFormOrganization
  candidates: readonly OrganizationMemberPickerCandidate[]
  onAdd: (commit: OrganizationMemberPickerCommit) => Promise<void>
  quickNpc?: OrganizationMemberPickerQuickNpc
  onCreateNpc?: () => void
  memberSelectionPolicy?: OrganizationMemberSelectionPolicy
  candidatesLoading?: boolean
}

function formatCandidateIdentityLine(candidate: OrganizationMemberPickerCandidate): string {
  return formatCharacterInlineSummary(buildConnectedPartyCharacterEntitySummary(candidate), {
    includeCharacterType: true,
  })
}

export function OrganizationMemberPickerDrawer({
  open,
  onOpenChange,
  organization,
  candidates,
  onAdd,
  quickNpc,
  onCreateNpc,
  memberSelectionPolicy,
  candidatesLoading,
}: OrganizationMemberPickerDrawerProps) {
  const [expandedItemId, setExpandedItemId] = React.useState<string | null>(null)
  const [selectedTitle, setSelectedTitle] = React.useState(ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE)
  const [pending, setPending] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const resetMembershipConfig = React.useCallback(() => {
    setExpandedItemId(null)
    setSelectedTitle(ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE)
    setSubmitError(null)
    setPending(false)
  }, [])

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (pending) return
      if (!nextOpen) {
        resetMembershipConfig()
      }
      onOpenChange(nextOpen)
    },
    [onOpenChange, pending, resetMembershipConfig],
  )

  const handleExpandedItemChange = React.useCallback((itemId: string | null) => {
    setExpandedItemId(itemId)
    setSelectedTitle(ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE)
    setSubmitError(null)
  }, [])

  const commitMembership = React.useCallback(
    async (candidate: OrganizationMemberPickerCandidate) => {
      if (pending) return

      const { title, priority } = resolveOrganizationMembershipMetadata({
        titles: organization.members?.titles ?? [],
        selectedTitle: titleFromMembershipRadioValue(selectedTitle),
      })

      setPending(true)
      setSubmitError(null)
      try {
        await onAdd({
          characterId: candidate.id,
          characterType: candidate.characterType,
          ...(title !== undefined ? { title } : {}),
          ...(priority !== undefined ? { priority } : {}),
        })
        resetMembershipConfig()
        onOpenChange(false)
      } catch (error) {
        const message =
          error instanceof Error && error.message.trim().length > 0
            ? error.message
            : ORGANIZATION_MEMBER_ADD_FAILED
        setSubmitError(message)
        setPending(false)
      }
    },
    [
      onAdd,
      onOpenChange,
      organization.functions,
      organization.practices,
      organization.organizationDomain,
      organization.organizationForm,
      pending,
      resetMembershipConfig,
      selectedTitle,
    ],
  )

  const transformVisibleItems = React.useCallback(
    (
      visibleItems: readonly OrganizationMemberPickerCandidate[],
      context: { searchQuery: string },
    ) =>
      filterAndSortOrganizationMemberPickerCandidates(visibleItems, {
        searchQuery: context.searchQuery,
        memberSelectionPolicy,
      }),
    [memberSelectionPolicy],
  )

  return (
    <CatalogEntityPickerSheet
      open={open}
      onOpenChange={handleOpenChange}
      loading={candidatesLoading}
      title={ORGANIZATION_MEMBER_PICKER_TITLE}
      description={`Choose a character to add to ${organization.name}.`}
      auxiliaryAction={
        quickNpc?.enabled
          ? quickNpc.buildContextFailed
            ? {
                state: 'unavailable',
                message: ORGANIZATION_MEMBER_PICKER_CREATE_NPC_UNAVAILABLE_MESSAGE,
              }
            : {
                state: 'action',
                label: ORGANIZATION_MEMBER_PICKER_CREATE_NPC_LABEL,
                onAction: () => onCreateNpc?.(),
                disabled: !quickNpc.buildContextReady,
              }
          : undefined
      }
      items={candidates}
      getItemKey={(candidate) => candidate.id}
      getItemToolbarLabel={(candidate) => candidate.name}
      getSearchText={buildConnectedPartyCharacterPickerSearchText}
      searchPlaceholder={ORGANIZATION_MEMBER_PICKER_SEARCH_PLACEHOLDER}
      noResultsMessage={ORGANIZATION_MEMBER_PICKER_NO_RESULTS_MESSAGE}
      noItemsMessage={ORGANIZATION_MEMBER_PICKER_NO_ITEMS_MESSAGE}
      transformVisibleItems={transformVisibleItems}
      expandedItemId={expandedItemId}
      onExpandedItemChange={handleExpandedItemChange}
      renderEntityRow={(args) => {
        const candidate = args.item

        return (
          <CatalogEntityRow
            toolbarLabel={args.toolbarLabel}
            domIds={args.domIds}
            collapsible={args.collapsible}
            collapsed={args.collapsed}
            onToggleCollapse={args.onToggleCollapse}
            summary={args.summary}
            details={args.details}
            entity={{
              heading: candidate.name,
              description: formatCandidateIdentityLine(candidate) ? (
                <CatalogPickerMetadataRenderer
                  lines={[
                    {
                      segments: [{ type: 'text', text: formatCandidateIdentityLine(candidate)! }],
                    },
                  ]}
                />
              ) : undefined,
              status: candidate.isMember
                ? [
                    {
                      kind: 'badge',
                      label: formatOrganizationMemberPickerStatusBadgeLabel(
                        candidate.membershipTitle,
                      ),
                      tone: 'success',
                    },
                  ]
                : candidate.isRecommended
                  ? [
                      {
                        kind: 'badge',
                        label: ORGANIZATION_MEMBER_PICKER_RECOMMENDED_LABEL,
                        appearance: 'outline',
                        tone: 'info',
                      },
                    ]
                  : undefined,
            }}
            trailing={
              candidate.isMember
                ? undefined
                : {
                    kind: 'action',
                    content: (
                      <CatalogPickerSelectionActions
                        canSelect
                        onAdd={() => handleExpandedItemChange(candidate.id)}
                        onRemove={() => undefined}
                      />
                    ),
                  }
            }
          />
        )
      }}
      renderItemDetails={(candidate) => {
        if (candidate.isMember) return null

        return (
          <div className="flex flex-col gap-4">
            <OrganizationMembershipTitleField
              titles={organization.members?.titles ?? []}
              value={
                expandedItemId === candidate.id
                  ? selectedTitle
                  : ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE
              }
              onValueChange={setSelectedTitle}
              idPrefix={`organization-member-${candidate.id}`}
            />
            {submitError && expandedItemId === candidate.id ? (
              <Text variant="destructive" role="alert">
                {submitError}
              </Text>
            ) : null}
            <div className="flex justify-end">
              <Button
                type="button"
                disabled={pending}
                onClick={() => {
                  void commitMembership(candidate)
                }}
              >
                {ORGANIZATION_MEMBER_PICKER_SUBMIT_LABEL}
              </Button>
            </div>
          </div>
        )
      }}
    />
  )
}
