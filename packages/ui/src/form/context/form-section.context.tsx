'use client'

import * as React from 'react'

import type { FieldSize } from '../../components/ui/field.client'
import {
  DEFAULT_FORM_FIELD_SIZE,
  DEFAULT_FORM_RHYTHM,
  fieldStackRhythmVariants,
  resolveFormFieldSize,
  type FieldStackRhythm,
} from '../../components/ui/field.variants'
import { cn } from '../../lib/utils'

export interface FormSectionContextValue {
  /** When false, sections render as plain fieldsets. Defaults to true on `<Form>`. */
  collapsibleSections: boolean
  /** Nesting depth; accordion sections only apply at depth 0. */
  depth: number
  /** Vertical gap between sibling fields/groups in the current section. */
  rhythm: FieldStackRhythm
  /** Control + label scale for leaf fields in this section. */
  size: FieldSize
}

export const FormSectionContext = React.createContext<FormSectionContextValue>({
  collapsibleSections: true,
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
}

/** Child section context — inherits rhythm and size unless overridden. */
export function buildFormSectionChildContext(
  parent: FormSectionContextValue,
  depth: number,
  overrides?: FormSectionContextOverrides,
): FormSectionContextValue {
  return {
    collapsibleSections: false,
    depth: depth + 1,
    rhythm: overrides?.rhythm ?? parent.rhythm,
    size: overrides?.size ?? parent.size,
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
  collapsibleSections?: boolean
  depth?: number
}

/** Supplies rhythm/size context for `FormItems` outside the schema-driven `<Form>`. */
export function FormSectionProvider({
  children,
  rhythm = DEFAULT_FORM_RHYTHM,
  size,
  collapsibleSections = true,
  depth = 0,
}: FormSectionProviderProps) {
  const resolvedSize = resolveFormFieldSize({ explicit: size, rhythm })
  const value = React.useMemo(
    () => ({ collapsibleSections, depth, rhythm, size: resolvedSize }),
    [collapsibleSections, depth, rhythm, resolvedSize],
  )
  return <FormSectionContext.Provider value={value}>{children}</FormSectionContext.Provider>
}
