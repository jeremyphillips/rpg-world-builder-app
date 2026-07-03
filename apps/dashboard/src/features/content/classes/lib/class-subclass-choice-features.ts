import {
  subclassChoiceFeatureId,
  subclassChoiceFeatureLabel,
  type ClassFeature,
} from '@rpg/contracts'

export const DEFAULT_SUBCLASS_CHOICE_LEVEL = 3

export function isSubclassChoiceFeatureRow(row: { id?: string } | undefined): boolean {
  return typeof row?.id === 'string' && row.id.endsWith('-subclass')
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
    kind: 'custom',
    id: subclassChoiceFeatureId(classSlug),
    name: subclassChoiceFeatureLabel(className),
    level,
    description: '',
  }
}
