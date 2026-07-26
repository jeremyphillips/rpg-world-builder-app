import type { CampaignNpcListItem } from '@rpg/contracts'

export type NpcOverviewTableRow = CampaignNpcListItem & { id: string }

export function toNpcOverviewTableRow(row: CampaignNpcListItem): NpcOverviewTableRow {
  return { ...row, id: row.character.id }
}
