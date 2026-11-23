import { getCreatureTraitTemplate } from '@rpg/contracts'
import type { MasterDetailListGroup } from '../../components/master-detail/master-detail-list-panel'
import type { MasterDetailListItem } from '../../lib/master-detail/master-detail-list-item.types'
import type { TraitRowForm } from './species-trait-form-fields'

const SENSES_GROUP_ID = 'senses'
const OTHER_GROUP_ID = 'other'

function speciesTraitListGroupId(row: TraitRowForm): string {
  if (row.kind === 'template' && row.templateId) {
    return getCreatureTraitTemplate(row.templateId)?.listGroup ?? OTHER_GROUP_ID
  }
  return OTHER_GROUP_ID
}

export function buildSpeciesTraitListGroups(
  rows: readonly { row: TraitRowForm; item: MasterDetailListItem }[],
  options?: { addControl?: MasterDetailListGroup['addControl'] },
): MasterDetailListGroup[] {
  const senses: MasterDetailListItem[] = []
  const other: MasterDetailListItem[] = []

  for (const entry of rows) {
    if (speciesTraitListGroupId(entry.row) === SENSES_GROUP_ID) {
      senses.push(entry.item)
    } else {
      other.push(entry.item)
    }
  }

  const groups: MasterDetailListGroup[] = []
  if (senses.length > 0) {
    groups.push({ id: SENSES_GROUP_ID, title: 'Senses', items: senses })
  }
  groups.push({
    id: OTHER_GROUP_ID,
    title: 'Other traits',
    items: other,
    addControl: options?.addControl,
  })

  return groups
}
