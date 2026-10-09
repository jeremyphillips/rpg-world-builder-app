import { CATALOG_SORT_AXES } from './catalog-sort-axes'
import {
  CATALOG_SORT_MODE_BEST_MATCH,
  CATALOG_SORT_MODE_NAME_ASC,
  CATALOG_SORT_MODE_NAME_DESC,
} from './catalog-sort-mode-ids'
import { CATALOG_SORT_PRESETS } from './catalog-sort-presets'

/** Cross-picker sort mode ids — prefer {@link CATALOG_SORT_MODE_*} for new code. */
export {
  CATALOG_SORT_MODE_BEST_MATCH as CATALOG_PICKER_SORT_BEST_MATCH,
  CATALOG_SORT_MODE_NAME_ASC as CATALOG_PICKER_SORT_NAME_ASC,
  CATALOG_SORT_MODE_NAME_DESC as CATALOG_PICKER_SORT_NAME_DESC,
}

/** Menu-row copy for shared name / best-match modes (flat-menu era names). */
export const CATALOG_PICKER_SORT_LABEL_BEST_MATCH = CATALOG_SORT_PRESETS.best_match.label
export const CATALOG_PICKER_SORT_LABEL_NAME_ASC = CATALOG_SORT_AXES.name.ascending.triggerLabel
export const CATALOG_PICKER_SORT_LABEL_NAME_DESC = CATALOG_SORT_AXES.name.descending.triggerLabel

/** Compact trigger copy for shared name / best-match modes. */
export const CATALOG_PICKER_SORT_TRIGGER_LABEL_BEST_MATCH =
  CATALOG_SORT_PRESETS.best_match.triggerLabel
export const CATALOG_PICKER_SORT_TRIGGER_LABEL_NAME_ASC = CATALOG_SORT_AXES.name.ascending.label
export const CATALOG_PICKER_SORT_TRIGGER_LABEL_NAME_DESC = CATALOG_SORT_AXES.name.descending.label
