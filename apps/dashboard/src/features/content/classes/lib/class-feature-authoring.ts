import {
  CLASS_FEATURE_KIND_ENTRIES,
  resolveClassFeatureName,
  subclassChoiceFeatureLabel,
  type ClassFeatureKind,
} from '@rpg/contracts'

import type { FeatureRowForm } from './class-feature-form-fields'
import { isSubclassChoiceFeatureRow } from './class-subclass-choice-features'

export const CLASS_FEATURE_ACQUISITION_LABELS = {
  custom: 'Custom feature',
  asi: 'Ability Score Improvement',
  'subclass-choice': 'Subclass',
} as const satisfies Record<Exclude<ClassFeatureKind, 'spellcasting'>, string>

export function classFeatureKindLabel(kind: ClassFeatureKind | undefined): string | undefined {
  if (!kind || kind === 'custom') return undefined
  return CLASS_FEATURE_KIND_ENTRIES[kind]?.label
}

export function countClassFeaturesByKind(
  rows: readonly Pick<FeatureRowForm, 'kind'>[] | undefined,
  kind: ClassFeatureKind,
): number {
  return (rows ?? []).filter((row) => (row.kind ?? 'custom') === kind).length
}

export function canAddSubclassChoiceFeature(rows: readonly FeatureRowForm[] | undefined): boolean {
  return countClassFeaturesByKind(rows, 'subclass-choice') === 0
}

export function resolveClassFeatureRowTitle(
  row: FeatureRowForm | undefined,
  className: string,
): string {
  if (!row) return ''
  const kind = row.kind ?? 'custom'
  if (kind === 'subclass-choice') {
    const derived = subclassChoiceFeatureLabel(className)
    const authored = row.name?.trim()
    return resolveClassFeatureName(
      { kind: 'subclass-choice', name: authored || undefined },
      className,
    )
  }
  return row.name?.trim() ?? ''
}

export function isSpellcastingFeatureRow(row: Pick<FeatureRowForm, 'kind'> | undefined): boolean {
  return row?.kind === 'spellcasting'
}

export function canDuplicateClassFeatureRow(
  row: Pick<FeatureRowForm, 'kind'> | undefined,
): boolean {
  const kind = row?.kind ?? 'custom'
  return kind !== 'spellcasting' && kind !== 'subclass-choice'
}

export function featureRowShowsInAddMenu(kind: ClassFeatureKind): boolean {
  return kind !== 'spellcasting'
}

export { isSubclassChoiceFeatureRow }
