'use client'

import * as React from 'react'
import type { DefaultValues, FieldValues, UseFormReturn } from 'react-hook-form'
import type { ZodType } from 'zod'

import { resolveSchemaFormFooter, SchemaFormShell } from './schema-form-shell.client'
import { type FileFieldPropsMap, type FormValueSync } from '../field-config'
import type { FieldSize } from '../../components/ui/field.client'
import type { FieldStackRhythm } from '../../components/ui/field.variants'
import { FormValueSyncEffects } from '../chrome/form-value-sync-effects.client'
import {
  resolveTabbedFormShellClassName,
  TabbedFormFooterRegion,
  TabbedFormPanels,
  useTabbedFormSetup,
  type TabbedFormFooterWrapperProps,
  type TabbedFormTab,
} from './tabbed-form-panels.client'

export type { TabbedFormFooterWrapperProps, TabbedFormTab }

export interface TabbedFormProps<TFieldValues extends FieldValues> {
  /** Merged Zod schema covering all tabs' fields combined. */
  schema: ZodType<TFieldValues>
  tabs: TabbedFormTab[]
  /**
   * Called with validated values when the global save button is submitted. The
   * second argument is the form instance — use it to surface server-side field
   * errors via `form.setError`.
   */
  onSubmit: (values: TFieldValues, form: UseFormReturn<TFieldValues>) => void | Promise<void>
  /** Pre-populate fields; merged on top of per-type synthesized defaults. */
  defaultValues?: DefaultValues<TFieldValues>
  /** Form-level error shown in the sticky actions bar (or below tabs when sticky is off). */
  formError?: string | null
  /**
   * Content rendered after the tabs (typically a save button). Pass a function
   * to read live form state (e.g. `formState.isSubmitting`).
   */
  footer?: React.ReactNode | ((form: UseFormReturn<TFieldValues>) => React.ReactNode)
  /** Optional id for the `<form>` element. */
  id?: string
  /**
   * Scopes persisted form UI state (e.g. array item collapse) to a stable form
   * instance — typically an entity or campaign id.
   */
  uiStateKey?: string
  /**
   * Per-file-field remote preview props (e.g. `existingImageUrl` from a storage key).
   * Keyed by field name; not part of the Zod schema.
   */
  fileFieldProps?: FileFieldPropsMap
  className?: string
  /** react-hook-form trigger mode. Defaults to `'onSubmit'`. */
  mode?: 'onSubmit' | 'onChange' | 'onBlur' | 'onTouched' | 'all'
  /**
   * Vertical gap between top-level fields/groups. Defaults to `comfortable`
   * (`gap-6`). Array sections default to `compact` regardless.
   */
  rhythm?: FieldStackRhythm
  /**
   * Control + label scale for leaf fields. When omitted, `compact` rhythm maps to
   * `sm` and `comfortable` maps to `md`.
   */
  size?: FieldSize
  /**
   * When true (default), the tab list sticks to the top and the footer sticks to
   * the bottom while scrolling long panels.
   */
  stickyChrome?: boolean
  /** Extra classes merged onto the sticky tab list wrapper (overrides default surface). */
  stickyTabsClassName?: string
  /** Extra classes merged onto the sticky actions bar (overrides default surface). */
  stickyActionsBarClassName?: string
  /** Wrap tab chrome and panels (e.g. `<Sheet.Body>` in a drawer layout). */
  contentWrapper?: (content: React.ReactNode) => React.ReactNode
  /**
   * Render the footer outside the sticky actions bar (e.g. `<Sheet.Footer>`).
   * When set, the internal sticky/inline footer chrome is not used.
   */
  footerWrapper?: (props: TabbedFormFooterWrapperProps) => React.ReactNode
  /** Patches form values when configured driver fields change after initial mount. */
  valueSyncs?: FormValueSync[]
  /** See `FormProps['validationPresentation']`. */
  validationPresentation?: import('../context/form-ui.context').FormValidationPresentation
}

/**
 * A schema-driven form with a tabbed layout. All tabs share a single
 * `useForm` instance over a merged schema; the save button and any form-level
 * error are rendered outside the tab panels in a sticky actions bar by default.
 */
export function TabbedForm<TFieldValues extends FieldValues>({
  schema,
  tabs,
  onSubmit,
  defaultValues,
  formError,
  footer,
  id,
  uiStateKey,
  fileFieldProps,
  className,
  mode,
  rhythm,
  size,
  stickyChrome = true,
  stickyTabsClassName,
  stickyActionsBarClassName,
  contentWrapper,
  footerWrapper,
  valueSyncs,
  validationPresentation,
}: TabbedFormProps<TFieldValues>) {
  const generatedFormId = React.useId()
  const formId = id ?? generatedFormId
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = React.useState(false)
  const markSubmitAttempted = React.useCallback(() => {
    setHasAttemptedSubmit(true)
  }, [])
  const { form } = useTabbedFormSetup({ schema, tabs, defaultValues, mode })
  const allFields = React.useMemo(() => tabs.flatMap((tab) => tab.fields), [tabs])
  const resolvedFooter = resolveSchemaFormFooter(footer, form)
  const hasFooterRegion = Boolean(formError || resolvedFooter)

  const panels = (
    <TabbedFormPanels
      tabs={tabs}
      formId={formId}
      stickyChrome={stickyChrome}
      stickyTabsClassName={stickyTabsClassName}
      omitPanelBottomPadding={Boolean(footerWrapper)}
    />
  )

  return (
    <SchemaFormShell
      form={form}
      formId={formId}
      fields={allFields}
      fileFieldProps={fileFieldProps}
      uiStateKey={uiStateKey}
      rhythm={rhythm}
      size={size}
      validationPresentation={validationPresentation}
      hasAttemptedSubmit={hasAttemptedSubmit}
      onMarkSubmitAttempted={markSubmitAttempted}
      onSubmit={onSubmit}
      className={resolveTabbedFormShellClassName(className, stickyChrome, footerWrapper)}
    >
      {valueSyncs && valueSyncs.length > 0 ? (
        <FormValueSyncEffects valueSyncs={valueSyncs} />
      ) : null}
      {contentWrapper ? contentWrapper(panels) : panels}
      <TabbedFormFooterRegion
        footerWrapper={footerWrapper}
        hasFooterRegion={hasFooterRegion}
        stickyChrome={stickyChrome}
        stickyActionsBarClassName={stickyActionsBarClassName}
        formError={formError}
        resolvedFooter={resolvedFooter}
      />
    </SchemaFormShell>
  )
}
