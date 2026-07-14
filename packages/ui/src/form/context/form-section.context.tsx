'use client'

import * as React from 'react'

import type { FieldSize } from '../../components/ui/field.client'
import type { FieldStackDependentsTone } from '../../components/ui/field-stack.variants'
import {
  DEFAULT_FORM_FIELD_SIZE,
  DEFAULT_FORM_RHYTHM,
  fieldStackRhythmVariants,
  resolveFormFieldSize,
  type FieldStackRhythm,
} from '../../components/ui/field.variants'
import { cn } from '../../lib/utils'

export interface FormSectionContextValue {
  /** Nesting depth for section rhythm/size inheritance. */
  depth: number
  /** Vertical gap between sibling fields/groups in the current section. */
  rhythm: FieldStackRhythm
  /** Control + label scale for leaf fields in this section. */
  size: FieldSize
  /** Surface tone for array item shells — defaults to `elevated` when unset. */
  arrayItemTone?: FieldStackDependentsTone
  /** True when the current section is nested inside a group fieldset. */
  inGroup?: boolean
}

export const FormSectionContext = React.createContext<FormSectionContextValue>({
  depth: 0,
  rhythm: DEFAULT_FORM_RHYTHM,
  size: DEFAULT_FORM_FIELD_SIZE,
})

export function useFormSectionContext(): FormSectionContextValue {
  return React.useContext(FormSectionContext)
}

export interface FormSectionContextOverrides {
  rhythm?: FieldStackRhythm
  size?: FieldSize
  arrayItemTone?: FieldStackDependentsTone
  inGroup?: boolean
}

/** Child section context — inherits rhythm and size unless overridden. */
export function buildFormSectionChildContext(
  parent: FormSectionContextValue,
  depth: number,
  overrides?: FormSectionContextOverrides,
): FormSectionContextValue {
  return {
    depth: depth + 1,
    rhythm: overrides?.rhythm ?? parent.rhythm,
    size: overrides?.size ?? parent.size,
    arrayItemTone: overrides?.arrayItemTone ?? parent.arrayItemTone,
    inGroup: overrides?.inGroup ?? parent.inGroup,
  }
}

export interface FormRhythmStackProps {
  className?: string
  /** Overrides inherited context rhythm for this stack only. */
  rhythm?: FieldStackRhythm
  children: React.ReactNode
}

/** Flex column stack whose gap follows form section rhythm. */
export function FormRhythmStack({ className, rhythm, children }: FormRhythmStackProps) {
  const { rhythm: inherited } = useFormSectionContext()
  const resolved = rhythm ?? inherited
  return (
    <div className={cn(fieldStackRhythmVariants({ rhythm: resolved }), className)}>{children}</div>
  )
}

export interface FormSectionProviderProps {
  children: React.ReactNode
  rhythm?: FieldStackRhythm
  /**
   * Control + label scale. When omitted, `compact` rhythm maps to `sm` and
   * `comfortable` maps to `md`.
   */
  size?: FieldSize
  depth?: number
}

/** Supplies rhythm/size context for `FormItems` outside the schema-driven `<Form>`. */
export function FormSectionProvider({
  children,
  rhythm = DEFAULT_FORM_RHYTHM,
  size,
  depth = 0,
}: FormSectionProviderProps) {
  const resolvedSize = resolveFormFieldSize({ explicit: size, rhythm })
  const value = React.useMemo(
    () => ({ depth, rhythm, size: resolvedSize }),
    [depth, rhythm, resolvedSize],
  )
  return <FormSectionContext.Provider value={value}>{children}</FormSectionContext.Provider>
}
