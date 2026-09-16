import { defineMasterDetailItemNoun } from '../../../lib/master-detail/master-detail-item-noun'

export const STARTING_EQUIPMENT_GROUP_LEGEND = 'Starting equipment'
export const STARTING_EQUIPMENT_GROUP_DESCRIPTION =
  "Define the class's baseline equipment and wealth. Characters choose one package during character creation."
export const STARTING_EQUIPMENT_OPTION_MASTER_DETAIL_ITEM_NOUN = defineMasterDetailItemNoun({
  label: 'Package',
  singular: 'package',
  plural: 'packages',
})
export const ADD_STARTING_EQUIPMENT_OPTION_LABEL = 'Add package'
export const REMOVE_STARTING_EQUIPMENT_LABEL = 'Remove starting equipment'
