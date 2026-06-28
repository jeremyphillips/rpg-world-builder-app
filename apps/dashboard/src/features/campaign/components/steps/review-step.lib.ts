import type { CampaignCreateValues } from '../../lib/campaign-settings-values'
import { buildRulesReviewRowsForSurface } from '../../lib/character-configuration-fields'
import {
  DIFFICULTY_LABELS,
  MAGIC_LEVEL_LABELS,
  MOOD_LABELS,
  PLAY_STYLE_LABELS,
} from '../../lib/labels'

export type ReviewRowData = {
  label: string
  value: string
}

export function buildIdentityRows(values: Partial<CampaignCreateValues>): ReviewRowData[] {
  const rows: ReviewRowData[] = [{ label: 'Name', value: values.name ?? '—' }]

  if (values.description) {
    rows.push({ label: 'Description', value: values.description })
  }

  const bannerFile = values.banner?.[0]
  if (bannerFile) {
    rows.push({ label: 'Image', value: bannerFile.name })
  }

  return rows
}

export function buildRulesRows(values: Partial<CampaignCreateValues>): ReviewRowData[] {
  return buildRulesReviewRowsForSurface('create', values)
}

function formatLabelList<T extends string>(
  values: T[] | undefined,
  labels: Record<T, string>,
): string {
  return values?.map((value) => labels[value]).join(', ') || '—'
}

export function buildFlavorRows(values: Partial<CampaignCreateValues>): ReviewRowData[] {
  return [
    { label: 'Play style', value: formatLabelList(values.playStyle, PLAY_STYLE_LABELS) },
    { label: 'Mood', value: formatLabelList(values.mood, MOOD_LABELS) },
    {
      label: 'Magic level',
      value: values.magicLevel ? MAGIC_LEVEL_LABELS[values.magicLevel] : '—',
    },
    {
      label: 'Difficulty',
      value: values.difficulty ? DIFFICULTY_LABELS[values.difficulty] : '—',
    },
  ]
}
