import type { RegionClassificationKind } from '@rpg/contracts'

/** Visible label for `classification.type` — matches political vs geographic family. */
export function resolveRegionClassificationTypeFieldLabel(
  classificationKind: RegionClassificationKind | '' | undefined,
): string {
  switch (classificationKind) {
    case 'political':
      return 'Political type'
    case 'geographic':
      return 'Geographic type'
    default:
      return 'Region type'
  }
}

export function resolveRegionClassificationTypeFieldPrompt(
  classificationKind: RegionClassificationKind | '' | undefined,
): string {
  return resolveRegionClassificationTypeFieldLabel(classificationKind)
}
