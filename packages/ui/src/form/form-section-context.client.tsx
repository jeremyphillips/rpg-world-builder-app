'use client'

import * as React from 'react'

import {
  DEFAULT_FORM_RHYTHM,
  fieldStackRhythmVariants,
  type FieldStackRhythm,
} from '../components/ui/field.variants'
import { cn } from '../lib/utils'

export interface FormSectionContextValue {
  /** When false, sections render as plain fieldsets. Defaults to true on `<Form>`. */
  collapsibleSections: boolean
  /** Nesting depth; accordion sections only apply at depth 0. */
  depth: number
  /** Vertical gap between sibling fields/groups in the current section. */
  rhythm: FieldStackRhythm
}

export const FormSectionContext = React.createContext<FormSectionContextValue>({
  collapsibleSections: true,
  depth: 0,
  rhythm: DEFAULT_FORM_RHYTHM,
})

export function useFormSectionContext(): FormSectionContextValue {
  return React.useContext(FormSectionContext)
}

/** Child section context — inherits rhythm unless overridden. */
export function buildFormSectionChildContext(
  parent: FormSectionContextValue,
  depth: number,
  rhythm?: FieldStackRhythm,
): FormSectionContextValue {
  return {
    collapsibleSections: false,
    depth: depth + 1,
    rhythm: rhythm ?? parent.rhythm,
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
