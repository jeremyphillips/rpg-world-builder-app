'use client'

import * as React from 'react'

import { resolveOrganizationMembershipMetadata } from '@rpg/contracts'
import { Badge, Button, CatalogPickerSheet, Text } from '@rpg/ui'

import {
  CatalogPickerMetadataRenderer,
  CatalogPickerSelectionActions,
  catalogPickerShellProps,
  formatCharacterInlineSummary,
  ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
  OrganizationMembershipTitleField,
  titleFromMembershipRadioValue,
  type QuickNpcCreateFormOrganization,
} from '@/features/character'
import { EntityItem } from '../../lib/content-entity-card.client'

import {
  buildConnectedPartyCharacterEntitySummary,
  buildConnectedPartyCharacterPickerSearchText,
  type LocationConnectedPartyCharacterOption,
} from '../../locations/lib/location-connected-party-character-options.lib'
import { ORGANIZATION_MEMBER_ADD_FAILED } from '../lib/organization-members.constants'

export const ORGANIZATION_MEMBER_PICKER_TITLE = 'Add member'
export const ORGANIZATION_MEMBER_PICKER_SUBMIT_LABEL = 'Add member'
export const ORGANIZATION_MEMBER_PICKER_SEARCH_PLACEHOLDER = 'Search characters'
export const ORGANIZATION_MEMBER_PICKER_NO_RESULTS_MESSAGE = 'No characters match this search.'
export const ORGANIZATION_MEMBER_PICKER_NO_ITEMS_MESSAGE = 'No characters are available.'
export const ORGANIZATION_MEMBER_PICKER_ALREADY_MEMBER_LABEL = 'Member'
export const ORGANIZATION_MEMBER_PICKER_CREATE_NPC_LABEL = 'Create new NPC'
export const ORGANIZATION_MEMBER_PICKER_CREATE_NPC_UNAVAILABLE_MESSAGE =
  'Quick NPC creation is unavailable — campaign build data failed to load.'

/** Campaign PC/NPC option plus whether the character already holds a membership here. */
export type OrganizationMemberPickerCandidate = LocationConnectedPartyCharacterOption & {
  isMember: boolean
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
        kind: organization.organizationKind,
        ...(organization.organizationSubtype !== undefined
          ? { subtype: organization.organizationSubtype }
          : {}),
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
      organization.organizationKind,
      organization.organizationSubtype,
      pending,
      resetMembershipConfig,
      selectedTitle,
    ],
  )

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={handleOpenChange}
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
      {...catalogPickerShellProps()}
      items={candidates}
      getItemKey={(candidate) => candidate.id}
      getItemToolbarLabel={(candidate) => candidate.name}
      getSearchText={buildConnectedPartyCharacterPickerSearchText}
      searchPlaceholder={ORGANIZATION_MEMBER_PICKER_SEARCH_PLACEHOLDER}
      noResultsMessage={ORGANIZATION_MEMBER_PICKER_NO_RESULTS_MESSAGE}
      noItemsMessage={ORGANIZATION_MEMBER_PICKER_NO_ITEMS_MESSAGE}
      expandedItemId={expandedItemId}
      onExpandedItemChange={handleExpandedItemChange}
      renderItemHeader={(candidate) => {
        const identityLine = formatCandidateIdentityLine(candidate)

        return (
          <EntityItem
            entity={{
              heading: candidate.name,
              description: identityLine ? (
                <CatalogPickerMetadataRenderer
                  lines={[{ segments: [{ type: 'text', text: identityLine }] }]}
                />
              ) : undefined,
              status: candidate.isMember
                ? [
                    <Badge key="member" tone="success">
                      {ORGANIZATION_MEMBER_PICKER_ALREADY_MEMBER_LABEL}
                    </Badge>,
                  ]
                : undefined,
            }}
            density="compact"
            action={
              candidate.isMember ? (
                <CatalogPickerSelectionActions
                  phase="success"
                  successLabel={ORGANIZATION_MEMBER_PICKER_ALREADY_MEMBER_LABEL}
                  onAdd={() => undefined}
                  onRemove={() => undefined}
                />
              ) : (
                <CatalogPickerSelectionActions
                  canSelect
                  onAdd={() => handleExpandedItemChange(candidate.id)}
                  onRemove={() => undefined}
                />
              )
            }
          />
        )
      }}
      renderItemDetails={(candidate) => {
        if (candidate.isMember) return null

        return (
          <div className="flex flex-col gap-4">
            <OrganizationMembershipTitleField
              kind={organization.organizationKind}
              subtype={organization.organizationSubtype}
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
