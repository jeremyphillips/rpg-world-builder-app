import type { Feat } from '@rpg/contracts'
import {
  FEAT_PART_ENTRIES,
  formatRequirementExpression,
  getFeatCategoryEntry,
  getFeatCategoryLabel,
} from '@rpg/contracts'

import type { ContentStatRowData } from '../../lib/detail/content-stat-rows'

export type FeatDetailViewModel = {
  statRows: ContentStatRowData[]
  description?: string
  repeatableNotes?: string
}

function buildFeatStatRows(feat: Feat): ContentStatRowData[] {
  const rows: ContentStatRowData[] = [
    {
      label: 'Category',
      value: getFeatCategoryLabel(feat.category),
      info: getFeatCategoryEntry(feat.category)?.description,
      infoAriaLabel: `About ${getFeatCategoryLabel(feat.category)}`,
    },
  ]

  if (feat.prerequisite) {
    rows.push({
      label: 'Prerequisite',
      value: formatRequirementExpression(feat.prerequisite),
    })
  }

  rows.push({
    label: 'Repeatable',
    value: feat.repeatable.allowed ? 'Yes' : 'No',
    info: FEAT_PART_ENTRIES.repeatable.description,
    infoPlacement: 'label',
  })

  return rows
}

export function buildFeatDetailViewModel(feat: Feat): FeatDetailViewModel {
  return {
    statRows: buildFeatStatRows(feat),
    description: feat.description || undefined,
    repeatableNotes:
      feat.repeatable.allowed && feat.repeatable.notes ? feat.repeatable.notes : undefined,
  }
}

/** Suffix stripped from category labels in overview tables (e.g. "Origin Feat" → "Origin"). */
const FEAT_CATEGORY_TABLE_SUFFIX = ' Feat'

/** Category label for feat overview tables — omits the trailing " Feat" suffix. */
export function formatFeatCategoryTableLabel(category: Feat['category']): string {
  const label = getFeatCategoryLabel(category)
  return label.endsWith(FEAT_CATEGORY_TABLE_SUFFIX)
    ? label.slice(0, -FEAT_CATEGORY_TABLE_SUFFIX.length)
    : label
}

/** Short prerequisite label for overview tables. */
export function formatFeatPrerequisiteSummary(feat: Feat): string {
  if (!feat.prerequisite) return '—'
  return formatRequirementExpression(feat.prerequisite, { abilityDisplay: 'id' })
}
