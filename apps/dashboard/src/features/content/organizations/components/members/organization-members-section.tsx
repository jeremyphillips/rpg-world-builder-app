import { SemanticText, Text } from '@rpg/ui'

import { DetailCollectionPanel } from '../../../lib/detail/collection/panel/detail-collection-panel'
import type { DetailOverflowAction } from '../../../lib/detail/detail-overflow-menu'
import { RelationshipList } from '../../../lib/relationship/list/relationship-list'
import type { OrganizationMemberRowVm } from '../../lib/members/build-organization-member-rows'
import { ORGANIZATION_SECTION_LABELS } from '../../lib/organization-display'
import {
  formatOrganizationMembersOverflow,
  ORGANIZATION_MEMBER_EDIT_LABEL,
  ORGANIZATION_MEMBER_REMOVE_LABEL,
  ORGANIZATION_MEMBERS_ADD_LABEL,
  ORGANIZATION_MEMBERS_LOAD_ERROR,
} from '../../lib/members/organization-members.constants'

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

function toRowMenu(row: OrganizationMemberRowVm, actions: DetailOverflowAction[]) {
  if (actions.length === 0) return undefined

  return {
    label: `Actions for ${row.name}`,
    items: actions.map((action) => ({
      id: action.id,
      label: action.label,
      destructive: action.destructive,
      disabled: action.disabled,
      onSelect: action.onSelect,
    })),
  }
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
  const addAction =
    canManage && onAddMember
      ? { label: ORGANIZATION_MEMBERS_ADD_LABEL, onSelect: onAddMember }
      : undefined

  return (
    <RelationshipList.Root itemCount={rows.length} emptyLabel={emptyText} action={addAction}>
      <RelationshipList.Group itemCount={rows.length}>
        {rows.map((row) => {
          const actions = buildMemberOverflowActions({
            row,
            canManage,
            isPending: pendingCharacterId === row.characterId,
            onEditMembership,
            onRemoveMember,
          })

          return (
            <RelationshipList.Row
              key={row.characterId}
              title={row.name}
              href={row.detailHref}
              headingSuffix={row.title ? ` · ${row.title}` : undefined}
              description={row.identityLine || undefined}
              menu={toRowMenu(row, actions)}
            />
          )
        })}
      </RelationshipList.Group>

      {total !== undefined && total > rows.length ? (
        <RelationshipList.Supplementary>
          <Text variant="muted">{formatOrganizationMembersOverflow(rows.length, total)}</Text>
        </RelationshipList.Supplementary>
      ) : null}
    </RelationshipList.Root>
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
    <DetailCollectionPanel
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
    </DetailCollectionPanel>
  )
}
