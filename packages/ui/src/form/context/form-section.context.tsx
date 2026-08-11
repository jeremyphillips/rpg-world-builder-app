'use client'

import * as React from 'react'

import type { SemanticSurfaceTone } from '../../components/ui/field-dependent.variants'
import { fieldStackRhythmVariants } from '../../components/ui/field.variants'
import type { SurfaceConfig } from '../../components/ui/visual-vocabulary.types'
import type { FieldSize } from '../../components/ui/field.client'
import { cn } from '../../lib/utils'
import { DEFAULT_FORM_DENSITY, resolveFormDensity, type FormDensity } from '../form-density'

export interface FormSectionContextValue {
  /** Nesting depth for section density inheritance. */
  depth: number
  /** Section density — rhythm and control scale resolve via {@link resolveFormDensity}. */
  density: FormDensity
  /** Surface config for array item shells — defaults to raised when unset. */
  arrayItemSurface?: SurfaceConfig
  /** Optional semantic wash for array item shells. */
  arrayItemTone?: SemanticSurfaceTone
  /** True when the current section is nested inside a group fieldset. */
  inGroup?: boolean
  /** True when a parent rhythm stack (`gap-*`) spaces sibling sections. */
  inRhythmStack?: boolean
}

export const FormSectionContext = React.createContext<FormSectionContextValue>({
  depth: 0,
  density: DEFAULT_FORM_DENSITY,
})

export function useFormSectionContext(): FormSectionContextValue {
  return React.useContext(FormSectionContext)
}

export interface FormSectionContextOverrides {
  density?: FormDensity
  arrayItemSurface?: SurfaceConfig
  arrayItemTone?: SemanticSurfaceTone
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
    density: parent.density,
    arrayItemSurface: parent.arrayItemSurface,
    arrayItemTone: parent.arrayItemTone,
    inGroup: parent.inGroup,
    inRhythmStack: parent.inRhythmStack,
  }

  return overrides ? { ...inherited, ...filterUndefined(overrides) } : inherited
}

/** Child section context — inherits density unless overridden. */
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
  children: React.ReactNode
}

/** Flex column stack whose gap follows form section density. */
export function FormRhythmStack({ className, children }: FormRhythmStackProps) {
  const parent = useFormSectionContext()
  const { rhythm } = resolveFormDensity(parent.density)
  const value = React.useMemo(() => ({ ...parent, inRhythmStack: true }), [parent])
  return (
    <FormSectionContext.Provider value={value}>
      <div className={cn(fieldStackRhythmVariants({ rhythm }), className)}>{children}</div>
    </FormSectionContext.Provider>
  )
}

export interface FormSectionProviderProps {
  children: React.ReactNode
  density?: FormDensity
  depth?: number
  /**
   * When true, top-level groups/arrays omit standalone bottom margin — a parent
   * rhythm stack (e.g. `<Form>` or a header shell) owns sibling spacing.
   */
  inRhythmStack?: boolean
}

/** Supplies density context for `FormItems` outside the schema-driven `<Form>`. */
export function FormSectionProvider({
  children,
  density = DEFAULT_FORM_DENSITY,
  depth = 0,
  inRhythmStack,
}: FormSectionProviderProps) {
  const value = React.useMemo(
    () => ({ depth, density, inRhythmStack }),
    [depth, density, inRhythmStack],
  )
  return <FormSectionContext.Provider value={value}>{children}</FormSectionContext.Provider>
}

export function useFieldControlSize(config: { controlSizeOverride?: FieldSize }): FieldSize {
  const { density } = useFormSectionContext()
  return config.controlSizeOverride ?? resolveFormDensity(density).size
}
