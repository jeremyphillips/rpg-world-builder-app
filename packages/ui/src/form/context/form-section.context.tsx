'use client'

import * as React from 'react'

import type { FieldSize } from '../../components/ui/field.client'
import type {
  FieldStatusTone,
  FieldSurfaceVariant,
} from '../../components/ui/field-dependent.variants'
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
  /** Surface variant for array item shells — defaults to `raised` when unset. */
  arrayItemSurface?: FieldSurfaceVariant
  /** Optional semantic status wash for array item shells. */
  arrayItemStatus?: FieldStatusTone
  /** True when the current section is nested inside a group fieldset. */
  inGroup?: boolean
  /** True when a parent rhythm stack (`gap-*`) spaces sibling sections. */
  inRhythmStack?: boolean
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
  arrayItemSurface?: FieldSurfaceVariant
  arrayItemStatus?: FieldStatusTone
  inGroup?: boolean
  inRhythmStack?: boolean
}

function filterUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as Partial<T>
}

function inheritSectionContextFields(
  parent: FormSectionContextValue,
  overrides?: FormSectionContextOverrides,
): Omit<FormSectionContextValue, 'depth'> {
  const inherited = {
    rhythm: parent.rhythm,
    size: parent.size,
    arrayItemSurface: parent.arrayItemSurface,
    arrayItemStatus: parent.arrayItemStatus,
    inGroup: parent.inGroup,
    inRhythmStack: parent.inRhythmStack,
  }

  return overrides ? { ...inherited, ...filterUndefined(overrides) } : inherited
}

/** Child section context — inherits rhythm and size unless overridden. */
export function buildFormSectionChildContext(
  parent: FormSectionContextValue,
  depth: number,
  overrides?: FormSectionContextOverrides,
): FormSectionContextValue {
  return {
    ...inheritSectionContextFields(parent, overrides),
    depth: depth + 1,
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
  const parent = useFormSectionContext()
  const resolved = rhythm ?? parent.rhythm
  const value = React.useMemo(
    () => ({ ...parent, rhythm: resolved, inRhythmStack: true }),
    [parent, resolved],
  )
  return (
    <FormSectionContext.Provider value={value}>
      <div className={cn(fieldStackRhythmVariants({ rhythm: resolved }), className)}>
        {children}
      </div>
    </FormSectionContext.Provider>
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
  /**
   * When true, top-level groups/arrays omit standalone bottom margin — a parent
   * rhythm stack (e.g. `<Form>` or a header shell) owns sibling spacing.
   */
  inRhythmStack?: boolean
}

/** Supplies rhythm/size context for `FormItems` outside the schema-driven `<Form>`. */
export function FormSectionProvider({
  children,
  rhythm = DEFAULT_FORM_RHYTHM,
  size,
  depth = 0,
  inRhythmStack,
}: FormSectionProviderProps) {
  const resolvedSize = resolveFormFieldSize({ explicit: size, rhythm })
  const value = React.useMemo(
    () => ({ depth, rhythm, size: resolvedSize, inRhythmStack }),
    [depth, inRhythmStack, rhythm, resolvedSize],
  )
  return <FormSectionContext.Provider value={value}>{children}</FormSectionContext.Provider>
}
