import type { AdminUserDeletionPreview, AdminUserListItem } from '@rpg/contracts'

function membershipCount(memberships: AdminUserListItem['campaignCounts'] | undefined): number {
  if (!memberships) return 0
  return memberships.owned + memberships.coOwned + memberships.joined
}

export function buildDeleteDependencyLines(
  dependencies: AdminUserDeletionPreview['dependencies'] | undefined,
): string[] {
  if (!dependencies) return []

  const lines: string[] = []

  if (dependencies.characters > 0) {
    lines.push(`${dependencies.characters} character${dependencies.characters === 1 ? '' : 's'}`)
  }

  const memberships = membershipCount(dependencies.memberships)
  if (memberships > 0) {
    lines.push(`${memberships} campaign membership${memberships === 1 ? '' : 's'}`)
  }

  if (dependencies.pendingInvites > 0) {
    lines.push(
      `${dependencies.pendingInvites} pending invitation${dependencies.pendingInvites === 1 ? '' : 's'}`,
    )
  }

  if (dependencies.acceptedInvites > 0) {
    lines.push(
      `${dependencies.acceptedInvites} accepted invitation${dependencies.acceptedInvites === 1 ? '' : 's'}`,
    )
  }

  return lines
}

export function resolveOwnedCampaignBlockCopy(
  user: Pick<AdminUserListItem, 'displayName' | 'campaignCounts'>,
  preview: AdminUserDeletionPreview | undefined,
): string {
  const ownedCount = preview?.dependencies.memberships.owned ?? user.campaignCounts.owned
  return `${user.displayName} owns ${ownedCount} campaign${ownedCount === 1 ? '' : 's'}. Transfer or delete those campaigns before deleting this account.`
}
