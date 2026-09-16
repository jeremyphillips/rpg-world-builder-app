import type { FieldHintPosition } from './field.variants'
import { fieldAnatomyStackVariants } from './field.variants'
import { resolveFieldWidthClassName, type FieldWidth } from './field-control.variants'
import type { FieldControlVariantProps } from './field-control.variants'
import { cn } from '../../lib/utils'

export type FieldSize = NonNullable<FieldControlVariantProps['size']>

/** Classes for a field that participates in a parent three-row anatomy grid. */
export const fieldRowParticipationClasses = 'row-span-3 grid grid-rows-subgrid'

export type FieldRootContextInput = {
  controlId: string
  error?: string
  invalid?: boolean
  describedByOverride?: string
  hint?: string
  hintPosition: FieldHintPosition
  size: FieldSize
  required: boolean
  hasDerivedMeta: boolean
}

export function buildFieldRootContextValue(input: FieldRootContextInput) {
  const hintId = `${input.controlId}-hint`
  const errorId = `${input.controlId}-error`
  const derivedMetaId = `${input.controlId}-derived-meta`
  const hasError = input.invalid ?? Boolean(input.error)
  const hasHint = Boolean(input.hint)
  const describedByParts = [
    hasHint && (!hasError || input.hintPosition === 'below-label') && hintId,
    hasError && errorId,
    input.hasDerivedMeta && derivedMetaId,
  ].filter(Boolean)
  const autoDescribedBy = describedByParts.length > 0 ? describedByParts.join(' ') : undefined
  const describedBy = input.describedByOverride ?? autoDescribedBy

  return {
    controlId: input.controlId,
    hintId,
    errorId,
    derivedMetaId,
    hasError,
    hasHint,
    hasDerivedMeta: input.hasDerivedMeta,
    describedBy,
    hintPosition: input.hintPosition,
    size: input.size,
    required: input.required,
    error: input.error,
    hint: input.hint,
  }
}

export function resolveFieldRootClassName(options: {
  size: FieldSize
  width: FieldWidth
  anatomy: boolean
  rowParticipation: boolean
  className?: string
}): string {
  const useAnatomy = options.anatomy || options.rowParticipation
  const layoutClassName = options.rowParticipation
    ? fieldRowParticipationClasses
    : useAnatomy
      ? 'flex flex-col'
      : fieldAnatomyStackVariants({ size: options.size })

  return cn(
    layoutClassName,
    resolveFieldWidthClassName(options.width, { rowParticipation: options.rowParticipation }),
    options.className,
  )
}
