'use client'

import { SemanticText, Text } from '@rpg/ui'

import { DetailSectionGroup } from '../../lib/detail/detail-section-group.client'
import { DetailSectionPanel } from '../../lib/detail/detail-section-panel.client'
import type { DetailOverflowAction } from '../../lib/detail/detail-overflow-menu.client'
import { CrossContentRelationshipRow } from '../../lib/relationship/cross-content-relationship-row.client'
import { RelationshipContentRow } from '../../lib/relationship/relationship-content-row.client'
import type { OrganizationMemberRowVm } from '../lib/build-organization-member-rows'
import { ORGANIZATION_SECTION_LABELS } from '../lib/organization-display'
import {
  formatOrganizationMembersOverflow,
  ORGANIZATION_MEMBER_EDIT_LABEL,
  ORGANIZATION_MEMBER_REMOVE_LABEL,
  ORGANIZATION_MEMBERS_ADD_LABEL,
  ORGANIZATION_MEMBERS_LOAD_ERROR,
} from '../lib/organization-members.constants'

export const ORGANIZATION_MEMBERS_HEADING_ID = 'organization-members-heading'

export type OrganizationMembersSectionProps = {
  rows: readonly OrganizationMemberRowVm[]
  /** Total members reported by the API — when it exceeds `rows`, an overflow note renders. */
  total?: number
  emptyText: string
  /**
   * SURFACE POLICY — organization-page member editing is manager-only (owner/co-owner).
   *
   * A PC owner whose own character is a member satisfies the server's per-character
   * `canEdit` policy, but still gets a read-only roster here: they edit their membership
   * from their own character sheet, which owns the membership record. The server policy
   * stays authoritative; this gate only narrows the surface. The roster itself stays
   * readable for everyone who can read the organization page.
   */
  canManage?: boolean
  isPending?: boolean
  isError?: boolean
  errorText?: string
  mutationError?: string | null
  pendingCharacterId?: string
  onAddMember?: () => void
  onEditMembership?: (row: OrganizationMemberRowVm) => void
  onRemoveMember?: (row: OrganizationMemberRowVm) => void
}

function buildMemberOverflowActions(input: {
  row: OrganizationMemberRowVm
  canManage: boolean
  isPending: boolean
  onEditMembership?: (row: OrganizationMemberRowVm) => void
  onRemoveMember?: (row: OrganizationMemberRowVm) => void
}): DetailOverflowAction[] {
  if (!input.canManage) return []

  const actions: DetailOverflowAction[] = []

  if (input.onEditMembership) {
    actions.push({
      id: 'edit-membership',
      label: ORGANIZATION_MEMBER_EDIT_LABEL,
      disabled: input.isPending,
      onSelect: () => input.onEditMembership?.(input.row),
    })
  }

  if (input.onRemoveMember) {
    actions.push({
      id: 'remove-member',
      label: ORGANIZATION_MEMBER_REMOVE_LABEL,
      destructive: true,
      disabled: input.isPending,
      onSelect: () => input.onRemoveMember?.(input.row),
    })
  }

  return actions
}

function OrganizationMemberRosterRow({
  row,
  canManage,
  isPending,
  onEditMembership,
  onRemoveMember,
}: {
  row: OrganizationMemberRowVm
  canManage: boolean
  isPending: boolean
  onEditMembership?: (row: OrganizationMemberRowVm) => void
  onRemoveMember?: (row: OrganizationMemberRowVm) => void
}) {
  return (
    <li>
      <CrossContentRelationshipRow
        heading={row.name}
        href={row.detailHref}
        headingSuffix={row.title ? ` · ${row.title}` : undefined}
        secondaryText={row.identityLine || undefined}
        actions={buildMemberOverflowActions({
          row,
          canManage,
          isPending,
          onEditMembership,
          onRemoveMember,
        })}
        overflowTriggerLabel={`Actions for ${row.name}`}
      />
    </li>
  )
}

function OrganizationMembersRosterBody({
  rows,
  total,
  emptyText,
  canManage,
  pendingCharacterId,
  onAddMember,
  onEditMembership,
  onRemoveMember,
}: Required<Pick<OrganizationMembersSectionProps, 'rows' | 'emptyText' | 'canManage'>> &
  Pick<
    OrganizationMembersSectionProps,
    'total' | 'pendingCharacterId' | 'onAddMember' | 'onEditMembership' | 'onRemoveMember'
  >) {
  const showContentRow = canManage || rows.length === 0

  return (
    <DetailSectionGroup>
      {rows.length > 0 ? (
        <ul className="space-y-1">
          {rows.map((row) => (
            <OrganizationMemberRosterRow
              key={row.characterId}
              row={row}
              canManage={canManage}
              isPending={pendingCharacterId === row.characterId}
              onEditMembership={onEditMembership}
              onRemoveMember={onRemoveMember}
            />
          ))}
        </ul>
      ) : null}

      {total !== undefined && total > rows.length ? (
        <Text variant="muted">{formatOrganizationMembersOverflow(rows.length, total)}</Text>
      ) : null}

      {showContentRow ? (
        <RelationshipContentRow
          emptyLabel={rows.length === 0 ? emptyText : undefined}
          addLabel={canManage && onAddMember ? ORGANIZATION_MEMBERS_ADD_LABEL : undefined}
          onAdd={canManage ? onAddMember : undefined}
        />
      ) : null}
    </DetailSectionGroup>
  )
}

/** Organization-facing roster of the character-owned organization memberships. */
export function OrganizationMembersSection({
  rows,
  total,
  emptyText,
  canManage = false,
  isPending = false,
  isError = false,
  errorText = ORGANIZATION_MEMBERS_LOAD_ERROR,
  mutationError = null,
  pendingCharacterId,
  onAddMember,
  onEditMembership,
  onRemoveMember,
}: OrganizationMembersSectionProps) {
  return (
    <DetailSectionPanel
      heading={ORGANIZATION_SECTION_LABELS.members}
      headingId={ORGANIZATION_MEMBERS_HEADING_ID}
    >
      {mutationError ? <SemanticText tone="destructive">{mutationError}</SemanticText> : null}

      {isPending ? (
        <Text variant="muted">Loading…</Text>
      ) : isError ? (
        <Text variant="muted">{errorText}</Text>
      ) : (
        <OrganizationMembersRosterBody
          rows={rows}
          total={total}
          emptyText={emptyText}
          canManage={canManage}
          pendingCharacterId={pendingCharacterId}
          onAddMember={onAddMember}
          onEditMembership={onEditMembership}
          onRemoveMember={onRemoveMember}
        />
      )}
    </DetailSectionPanel>
  )
}
