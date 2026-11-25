'use client'

import * as React from 'react'

import type {
  FormSurfaceHost,
  SemanticSurfaceTone,
} from '../../components/ui/field-dependent.variants'
import { fieldStackRhythmVariants } from '../../components/ui/field.variants'
import type { SurfaceConfig } from '../../components/ui/visual-vocabulary.types'
import type { FieldSize } from '../../components/ui/field.client'
import type { FieldChrome } from '../../components/ui/field-chrome.variants'
import { cn } from '../../lib/utils'
import { DEFAULT_FORM_DENSITY, resolveFormDensity, type FormDensity } from '../form-density'
import { resolveFieldControlSize } from '../resolve-field-control-size.lib'

export interface FormSectionContextValue {
  /** Nesting depth for section density inheritance. */
  depth: number
  /** Count of named ancestor groups/arrays — anonymous layout groups are transparent. */
  namedGroupDepth: number
  /** Presentation density — labels, hints, section headers, rhythm stacks that read context. */
  density: FormDensity
  /**
   * When an array omits `density`, legends and section chrome follow this while item
   * fields use `density` (typically compact). Internal — set at array boundaries only.
   */
  arraySectionPresentationDensity?: FormDensity
  /**
   * Inherited control default when presentation density must not imply control scale
   * (e.g. compact array item fields under a comfortable parent).
   */
  defaultControlSize?: FieldSize
  /** Surface config for array item shells — defaults to subtle when unset. */
  arrayItemSurface?: SurfaceConfig
  /** Optional semantic wash for array item shells. */
  arrayItemTone?: SemanticSurfaceTone
  /** True when the current section is nested inside a group fieldset. */
  inGroup?: boolean
  /** True when a parent rhythm stack (`gap-*`) spaces sibling sections. */
  inRhythmStack?: boolean
  /** Nearest ancestor `fieldChrome` cascade for leaf/row/slot container resolution. */
  fieldChromeCascade?: FieldChrome
  /** When true, leaf fields default to no container unless explicitly configured. */
  fieldChromeSuppressed?: boolean
  /** Reserved preview mounts can prohibit rules previews in descendant display fields. */
  reserveRulesPreview?: boolean
  /** Internal nesting plane for dependent nest fill — not author-facing. */
  surfaceHost?: FormSurfaceHost
}

export const FormSectionContext = React.createContext<FormSectionContextValue>({
  depth: 0,
  namedGroupDepth: 0,
  density: DEFAULT_FORM_DENSITY,
})

export function useFormSectionContext(): FormSectionContextValue {
  return React.useContext(FormSectionContext)
}

/** Parent density leg for array section chrome when item fields use a denser context. */
export function resolveArraySectionDensityParent(
  context: Pick<FormSectionContextValue, 'density' | 'arraySectionPresentationDensity'>,
): Pick<FormSectionContextValue, 'density'> {
  return { density: context.arraySectionPresentationDensity ?? context.density }
}

export interface FormSectionContextOverrides {
  density?: FormDensity
  arraySectionPresentationDensity?: FormDensity
  defaultControlSize?: FieldSize
  namedGroupDepth?: number
  arrayItemSurface?: SurfaceConfig
  arrayItemTone?: SemanticSurfaceTone
  inGroup?: boolean
  inRhythmStack?: boolean
  fieldChromeCascade?: FieldChrome
  fieldChromeSuppressed?: boolean
  surfaceHost?: FormSurfaceHost
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
    arraySectionPresentationDensity: parent.arraySectionPresentationDensity,
    defaultControlSize: parent.defaultControlSize,
    namedGroupDepth: parent.namedGroupDepth,
    arrayItemSurface: parent.arrayItemSurface,
    arrayItemTone: parent.arrayItemTone,
    inGroup: parent.inGroup,
    inRhythmStack: parent.inRhythmStack,
    fieldChromeCascade: parent.fieldChromeCascade,
    fieldChromeSuppressed: parent.fieldChromeSuppressed,
    surfaceHost: parent.surfaceHost,
    reserveRulesPreview: parent.reserveRulesPreview,
  }

  return overrides ? { ...inherited, ...filterUndefined(overrides) } : inherited
}

/** Child section context — inherits presentation and control defaults unless overridden. */
export function buildFormSectionChildContext(
  parent: FormSectionContextValue,
  depth: number,
  overrides?: FormSectionContextOverrides,
): FormSectionContextValue {
  const inherited = inheritSectionContextFields(parent, overrides)
  let defaultControlSize = inherited.defaultControlSize
  if (overrides?.density !== undefined) {
    defaultControlSize = overrides.defaultControlSize
  } else if (overrides?.defaultControlSize !== undefined) {
    defaultControlSize = overrides.defaultControlSize
  }
  return {
    ...inherited,
    defaultControlSize,
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
    () => ({ depth, namedGroupDepth: 0, density, inRhythmStack }),
    [depth, density, inRhythmStack],
  )
  return <FormSectionContext.Provider value={value}>{children}</FormSectionContext.Provider>
}

/** Resolves control scale from section context and an optional leaf override. */
export function useFieldControlSize(controlSizeOverride?: FieldSize): FieldSize {
  const { density, defaultControlSize } = useFormSectionContext()
  return resolveFieldControlSize({
    density,
    defaultControlSize,
    override: controlSizeOverride,
  })
}
