import { OverviewBulkActionsMenu } from '@/lib/overview/overview-bulk-actions-menu'

export const NPC_BULK_ACTIONS_MENU_LABEL = 'Bulk actions' as const
export const NPC_BULK_ACTION_EDIT_ROSTER_STATUS_LABEL = 'Edit roster status' as const

export type NpcBulkActionsMenuProps = {
  onEditRosterStatus: () => void
}

export function NpcBulkActionsMenu({ onEditRosterStatus }: NpcBulkActionsMenuProps) {
  return (
    <OverviewBulkActionsMenu
      menuLabel={NPC_BULK_ACTIONS_MENU_LABEL}
      actions={[
        {
          id: 'edit-roster-status',
          label: NPC_BULK_ACTION_EDIT_ROSTER_STATUS_LABEL,
          onSelect: onEditRosterStatus,
        },
      ]}
    />
  )
}
