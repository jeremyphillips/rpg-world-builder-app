import {
  getSpeciesHeritageLabel,
  getSpeciesHeritageOptionsLabel,
  getSpeciesHeritageSentenceForm,
} from '@rpg/contracts'

import { defineMasterDetailItemNoun } from '../../lib/master-detail/master-detail-item-noun'

const heritage = getSpeciesHeritageSentenceForm(1)

export const HERITAGE_OPTION_MASTER_DETAIL_ITEM_NOUN = defineMasterDetailItemNoun({
  label: `${heritage} option`,
  singular: `${heritage} option`,
  plural: `${heritage} options`,
})
export const HERITAGE_OPTIONS_LIST_TITLE = getSpeciesHeritageOptionsLabel()
export const ADD_HERITAGE_OPTION_LABEL = 'Add option'
export const HERITAGE_EMPTY_TITLE = `No ${heritage} group yet`
export const HERITAGE_EMPTY_DESCRIPTION = `Create a set of ${heritage} choices players can select during character creation.`
export const SET_UP_HERITAGE_LABEL = `Set up ${heritage}`
export const HERITAGE_GROUP_LEGEND = `${getSpeciesHeritageLabel()} group`
export const HERITAGE_GROUP_NAME_FALLBACK = `${getSpeciesHeritageLabel()} group`
export const HERITAGE_GROUP_DESCRIPTION = `Configure this set of ${heritage} choices that players can select during character creation.`
export const HERITAGE_GROUP_OVERFLOW_LABEL = `${getSpeciesHeritageLabel()} group actions`
export const REMOVE_HERITAGE_GROUP_ACTION = `Remove ${heritage} group`
export const HERITAGE_NAME_HINT = `The name of this ${heritage} option group, e.g. “Draconic Ancestry” or “Elven Lineage.”`
