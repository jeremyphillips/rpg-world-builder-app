import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ActionIcon, Badge, ButtonLink, Heading, RowActionsMenu, Text } from '@rpg/ui'
import { PLATFORM_ROLE_ENTRIES } from '@rpg/contracts'
import { joinInlineMetadata } from '@rpg/contracts/primitives'

import { ROUTES } from '@/app/routes'
import { PageShell } from '@/components/layout/page/page-shell'
import { useIsSuperadmin } from '@/features/auth'

import { DeleteUserDialog } from '../components/delete-user-dialog'
import { AdminUserContextLine } from '../components/admin-user-tab-nav'
import { useAdminUserRouteContext } from '../lib/use-admin-user-route-context'
import { toAdminUserDeleteSubject } from '../lib/admin-user-delete-subject'
import {
  formatAdminUserDetailJoined,
  formatAdminUserDetailLastActive,
  formatAdminUserDetailTimestamp,
} from '../lib/admin-user-detail-labels'
import { formatAdminUserCampaignCounts } from '../lib/admin-users-labels'
import { getPrimaryDeleteBlockReasonMessage } from '../lib/admin-users-labels'

export function AdminUserDetail() {
  const { user } = useAdminUserRouteContext()
  const navigate = useNavigate()
  const isSuperadmin = useIsSuperadmin()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const deleteSubject = toAdminUserDeleteSubject({
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    canDelete: user.canDelete,
    deleteBlockedReasons: user.deleteBlockedReasons,
    campaignCounts: user.campaignCounts,
  })

  const deleteDisabled = !isSuperadmin || !user.canDelete
  const deleteReason = !isSuperadmin
    ? 'Only superadmins can delete users'
    : getPrimaryDeleteBlockReasonMessage(user.deleteBlockedReasons)

  const showInvites = user.pendingInviteCount > 0 || user.acceptedIncompleteInviteCount > 0

  return (
    <PageShell width="narrow" rhythm="loose">
      <div className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <Heading variant="page" as="h1">
                {user.displayName}
              </Heading>
              <Badge appearance="outline" tone="neutral">
                {PLATFORM_ROLE_ENTRIES[user.platformRole].label}
              </Badge>
            </div>
            <Text variant="muted">{user.email}</Text>
            <AdminUserContextLine />
            <Text variant="small" className="text-muted-foreground">
              User ID: {user.id}
            </Text>
            <Text variant="small" className="text-muted-foreground">
              Joined {formatAdminUserDetailJoined(user.createdAt)}
            </Text>
          </div>

          <RowActionsMenu
            triggerVariant="outline-icon"
            triggerLabel="User actions"
            items={[
              {
                kind: 'action',
                id: 'delete-user',
                label: 'Delete user',
                icon: <ActionIcon action="delete" />,
                destructive: true,
                disabled: deleteDisabled,
                disabledReason: deleteReason,
                onSelect: () => setDeleteOpen(true),
              },
            ]}
          />
        </div>
      </div>

      <section className="space-y-3">
        <Heading variant="section" as="h2">
          Account summary
        </Heading>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-style-caption">Access</dt>
            <dd className="text-style-label">{PLATFORM_ROLE_ENTRIES[user.platformRole].label}</dd>
          </div>
          <div>
            <dt className="text-style-caption">Joined</dt>
            <dd className="text-style-label">{formatAdminUserDetailJoined(user.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-style-caption">Last signed in</dt>
            <dd className="text-style-label">
              {formatAdminUserDetailTimestamp(user.lastSignedInAt)}
            </dd>
          </div>
          <div>
            <dt className="text-style-caption">Last active</dt>
            <dd className="text-style-label">
              {formatAdminUserDetailLastActive(user.lastActiveAt)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="space-y-3">
        <Heading variant="section" as="h2">
          Relationships
        </Heading>
        <dl className="space-y-3">
          <div>
            <dt className="text-style-caption">Campaigns</dt>
            <dd className="text-style-label">
              {formatAdminUserCampaignCounts(user.campaignCounts)}
            </dd>
            <Link
              to={ROUTES.admin.user.campaigns(user.id)}
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              View campaigns
            </Link>
          </div>
          <div>
            <dt className="text-style-caption">Characters</dt>
            <dd className="text-style-label">
              {joinInlineMetadata([
                `${user.characterCount} character${user.characterCount === 1 ? '' : 's'}`,
                `${user.controlledCharacterCount} controlled in campaigns`,
              ])}
            </dd>
            <Link
              to={ROUTES.admin.user.characters(user.id)}
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              View characters
            </Link>
          </div>
          {showInvites ? (
            <div>
              <dt className="text-style-caption">Invitations</dt>
              <dd className="space-y-1 text-style-label">
                {user.pendingInviteCount > 0 ? (
                  <span>Pending: {user.pendingInviteCount}</span>
                ) : null}
                {user.acceptedIncompleteInviteCount > 0 ? (
                  <span>Accepted, incomplete: {user.acceptedIncompleteInviteCount}</span>
                ) : null}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      <div className="flex flex-wrap gap-2">
        <ButtonLink
          link={<Link to={ROUTES.admin.user.campaigns(user.id)} />}
          variant="outline"
          size="sm"
        >
          View campaigns
        </ButtonLink>
        <ButtonLink
          link={<Link to={ROUTES.admin.user.characters(user.id)} />}
          variant="outline"
          size="sm"
        >
          View characters
        </ButtonLink>
      </div>

      <DeleteUserDialog
        user={deleteSubject}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => navigate(ROUTES.admin.users)}
      />
    </PageShell>
  )
}
