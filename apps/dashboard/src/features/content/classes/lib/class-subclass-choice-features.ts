import {
  CLASS_FEATURE_KINDS,
  subclassChoiceFeatureId,
  subclassChoiceFeatureLabel,
  type ClassFeature,
  type ClassFeatureKind,
} from '@rpg/contracts'

export const DEFAULT_SUBCLASS_CHOICE_LEVEL = 3

export const SUBCLASS_CHOICE_FEATURE_KIND = CLASS_FEATURE_KINDS[1] satisfies ClassFeatureKind

export function isSubclassChoiceFeatureRow(row: { kind?: string } | undefined): boolean {
  return row?.kind === SUBCLASS_CHOICE_FEATURE_KIND
}

/** Creates the explicit feature row that marks when a class chooses a subclass. */
export function createSubclassChoiceFeature({
  classSlug,
  className,
  level = DEFAULT_SUBCLASS_CHOICE_LEVEL,
}: {
  classSlug: string
  className: string
  level?: number
}): ClassFeature {
  return {
    kind: SUBCLASS_CHOICE_FEATURE_KIND,
    id: subclassChoiceFeatureId(classSlug),
    name: subclassChoiceFeatureLabel(className),
    level,
    description: '',
  }
}
