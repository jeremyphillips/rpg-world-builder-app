import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ActionIcon,
  Badge,
  ButtonLink,
  Heading,
  MetadataList,
  RowActionsMenu,
  standaloneTextActionClasses,
  Text,
} from '@rpg/ui'
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
            <Text variant="supporting">User ID: {user.id}</Text>
            <Text variant="supporting">Joined {formatAdminUserDetailJoined(user.createdAt)}</Text>
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
        <MetadataList
          size="sm"
          divider={false}
          emphasis="value"
          valueTrack="fill"
          items={[
            {
              id: 'access',
              label: 'Access',
              value: PLATFORM_ROLE_ENTRIES[user.platformRole].label,
            },
            {
              id: 'joined',
              label: 'Joined',
              value: formatAdminUserDetailJoined(user.createdAt),
            },
            {
              id: 'last-signed-in',
              label: 'Last signed in',
              value: formatAdminUserDetailTimestamp(user.lastSignedInAt),
            },
            {
              id: 'last-active',
              label: 'Last active',
              value: formatAdminUserDetailLastActive(user.lastActiveAt),
            },
          ]}
        />
      </section>

      <section className="space-y-3">
        <Heading variant="section" as="h2">
          Relationships
        </Heading>
        <MetadataList
          size="sm"
          divider={false}
          emphasis="value"
          valueTrack="fill"
          items={[
            {
              id: 'campaigns',
              label: 'Campaigns',
              value: (
                <>
                  {formatAdminUserCampaignCounts(user.campaignCounts)}
                  <Link
                    to={ROUTES.admin.user.campaigns(user.id)}
                    className={standaloneTextActionClasses('accent')}
                  >
                    View campaigns
                  </Link>
                </>
              ),
            },
            {
              id: 'characters',
              label: 'Characters',
              value: (
                <>
                  {joinInlineMetadata([
                    `${user.characterCount} character${user.characterCount === 1 ? '' : 's'}`,
                    `${user.controlledCharacterCount} controlled in campaigns`,
                  ])}
                  <Link
                    to={ROUTES.admin.user.characters(user.id)}
                    className={standaloneTextActionClasses('accent')}
                  >
                    View characters
                  </Link>
                </>
              ),
            },
            ...(showInvites
              ? [
                  {
                    id: 'invitations',
                    label: 'Invitations',
                    value: (
                      <span className="flex flex-col gap-1">
                        {user.pendingInviteCount > 0 ? (
                          <span>Pending: {user.pendingInviteCount}</span>
                        ) : null}
                        {user.acceptedIncompleteInviteCount > 0 ? (
                          <span>Accepted, incomplete: {user.acceptedIncompleteInviteCount}</span>
                        ) : null}
                      </span>
                    ),
                  },
                ]
              : []),
          ]}
        />
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
