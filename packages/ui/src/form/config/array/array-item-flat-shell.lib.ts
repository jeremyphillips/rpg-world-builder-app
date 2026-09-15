import type { ArrayItemResolvedPresentation } from './array-item-presentation.lib'
import {
  arrayItemFlatMergedShellClasses,
  arrayItemFlatShellRadiusClasses,
} from '../../renderers/array/array-item-toolbar.variants'

export type ArrayItemFlatStackPosition = 'only' | 'first' | 'middle' | 'last'

export function resolveArrayItemFlatStackPosition(
  index: number,
  fieldsLength: number,
): ArrayItemFlatStackPosition {
  if (fieldsLength <= 1) return 'only'
  if (index === 0) return 'first'
  if (index === fieldsLength - 1) return 'last'
  return 'middle'
}

export function resolveArrayItemFlatShellClassName(
  presentation: Pick<ArrayItemResolvedPresentation, 'chrome' | 'stackTreatment'>,
  stackPosition: ArrayItemFlatStackPosition,
): string | undefined {
  if (presentation.chrome !== 'flat') return undefined
  if (presentation.stackTreatment === 'merged') {
    return arrayItemFlatMergedShellClasses(stackPosition)
  }
  return arrayItemFlatShellRadiusClasses
}
