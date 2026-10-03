import { ActionIcon, SemanticText, Text } from '@rpg/ui'

import { ContentDetailSection } from '../../../lib/detail/page/content-detail-section'
import {
  detailOverflowDeleteAction,
  type DetailOverflowAction,
} from '../../../lib/detail/detail-overflow-menu'
import {
  detailOverflowActionsToRowMenuItems,
  EntityRowList,
} from '../../../lib/entity/row-list/entity-row-list'
import type { OrganizationMemberRowVm } from '../../lib/members/build-organization-member-rows'
import { buildOrganizationMemberLeadingMedia } from '../../lib/members/organization-member-leading-media.lib'
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
      icon: <ActionIcon action="edit" step="md" />,
      disabled: input.isPending,
      onSelect: () => input.onEditMembership?.(input.row),
    })
  }

  if (input.onRemoveMember) {
    actions.push({
      ...detailOverflowDeleteAction(ORGANIZATION_MEMBER_REMOVE_LABEL, () =>
        input.onRemoveMember?.(input.row),
      ),
      id: 'remove-member',
      disabled: input.isPending,
    })
  }

  return actions
}

function toRowMenu(row: OrganizationMemberRowVm, actions: DetailOverflowAction[]) {
  if (actions.length === 0) return undefined

  return {
    label: `Actions for ${row.name}`,
    items: detailOverflowActionsToRowMenuItems(actions),
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
    <EntityRowList.Root itemCount={rows.length} emptyLabel={emptyText} action={addAction}>
      <EntityRowList.Group itemCount={rows.length}>
        {rows.map((row) => {
          const actions = buildMemberOverflowActions({
            row,
            canManage,
            isPending: pendingCharacterId === row.characterId,
            onEditMembership,
            onRemoveMember,
          })

          return (
            <EntityRowList.Row
              key={row.characterId}
              heading={row.name}
              headingHref={row.detailHref}
              headingAccessory={row.title || undefined}
              description={row.identityLine || undefined}
              leadingMedia={buildOrganizationMemberLeadingMedia(row)}
              menu={toRowMenu(row, actions)}
            />
          )
        })}
      </EntityRowList.Group>

      {total !== undefined && total > rows.length ? (
        <EntityRowList.Supplementary>
          <Text variant="muted">{formatOrganizationMembersOverflow(rows.length, total)}</Text>
        </EntityRowList.Supplementary>
      ) : null}
    </EntityRowList.Root>
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
    <ContentDetailSection
      bodyLayout="list"
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
    </ContentDetailSection>
  )
}
