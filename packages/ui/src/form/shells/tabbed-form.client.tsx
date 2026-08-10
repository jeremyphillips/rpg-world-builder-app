'use client'

import * as React from 'react'
import type { DefaultValues, FieldErrors, FieldValues, UseFormReturn } from 'react-hook-form'
import type { ZodType } from 'zod'

import { resolveSchemaFormFooter, SchemaFormShell } from './schema-form-shell.client'
import { type FileFieldPropsMap, type FormItem, type FormValueSync } from '../field-config'
import type { FieldSize } from '../../components/ui/field.client'
import type { FieldStackRhythm } from '../../components/ui/field.variants'
import { FormValueSyncEffects } from '../chrome/form-value-sync-effects.client'
import type { FormUiContextValue, FormValidationPresentation } from '../context/form-ui.context'
import { navigateTabbedFormInvalidSubmit } from './navigate-tabbed-form-invalid-submit.client'
import { TabbedFormChromeContext } from './tabbed-form-chrome.context'
import type { ValidateSilently } from '../context/form-ui.context'
import { TabbedFormErrorSummary } from './tabbed-form-error-summary.client'
import { FormRhythmStack } from '../context/form-section.context'
import {
  FormShellFooterPublisher,
  type FormShellFooterModel,
} from '../chrome/form-shell-footer.context'
import {
  resolveTabbedFormShellClassName,
  TabbedFormFooterRegion,
  TabbedFormPanels,
  useTabbedFormSetup,
  type TabbedFormTab,
} from './tabbed-form-panels.client'

export type { TabbedFormTab }
export { collectTabbedFormResolverItems } from './tabbed-form-panels.client'

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
  /**
   * Content rendered inside the form before the tab strip. Pass a function to
   * read form state (e.g. for hoisted identity fields above tabs).
   */
  header?: React.ReactNode | ((form: UseFormReturn<TFieldValues>) => React.ReactNode)
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
   * Publish footer semantics to a sibling {@link FormShellFooterSlot} inside overlay
   * shell chrome. Requires an ancestor {@link FormShellFooterScope}.
   */
  externalFooter?: boolean
  /** Patches form values when configured driver fields change after initial mount. */
  valueSyncs?: FormValueSync[]
  /** See `FormProps['validationPresentation']`. */
  validationPresentation?: FormValidationPresentation
}

function buildExternalFooterModel(
  formId: string,
  formError: string | null | undefined,
  footer: React.ReactNode,
): FormShellFooterModel | null {
  if (!footer && !formError) {
    return null
  }
  return {
    formId,
    footer,
    formError: formError ?? null,
  }
}

/**
 * A schema-driven form with a tabbed layout. All tabs share a single
 * `useForm` instance over a merged schema; the save button and any form-level
 * error are rendered outside the tab panels in a sticky actions bar by default.
 */
// fallow-ignore-next-line complexity
export function TabbedForm<TFieldValues extends FieldValues>({
  schema,
  tabs,
  onSubmit,
  defaultValues,
  formError,
  footer,
  header,
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
  externalFooter = false,
  valueSyncs,
  validationPresentation,
}: TabbedFormProps<TFieldValues>) {
  const generatedFormId = React.useId()
  const formId = id ?? generatedFormId
  const [activeTabId, setActiveTabId] = React.useState(tabs[0]?.id ?? '')
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = React.useState(false)
  const markSubmitAttempted = React.useCallback(() => {
    setHasAttemptedSubmit(true)
  }, [])
  const { form, validateSilently } = useTabbedFormSetup({ schema, tabs, defaultValues, mode })
  const allFields = React.useMemo(() => tabs.flatMap((tab) => tab.fields), [tabs])
  const tabbedChrome = React.useMemo(
    () => ({ formId, tabs, setActiveTabId }),
    [formId, tabs, setActiveTabId],
  )
  const resolvedFooter = resolveSchemaFormFooter(footer, form)
  const resolvedHeader = resolveSchemaFormFooter(header, form)
  const handleInvalidSubmit = React.useCallback(
    (
      invalidForm: UseFormReturn<TFieldValues>,
      fields: FormItem[],
      invalidFormId: string,
      ui: Pick<FormUiContextValue, 'markSubmitAttempted' | 'addValidationSessionExpandKeys'>,
      errors: FieldErrors<TFieldValues>,
    ) => {
      navigateTabbedFormInvalidSubmit(
        invalidForm,
        fields,
        invalidFormId,
        tabs,
        ui,
        errors,
        setActiveTabId,
      )
    },
    [tabs],
  )

  const validationSummary = (
    <TabbedFormErrorSummary
      tabs={tabs}
      fields={allFields}
      formId={formId}
      onActiveTabChange={setActiveTabId}
    />
  )

  const externalFooterModel = externalFooter
    ? buildExternalFooterModel(formId, formError, resolvedFooter)
    : null

  const panels = (
    <TabbedFormPanels
      tabs={tabs}
      formId={formId}
      activeTabId={activeTabId}
      onActiveTabChange={setActiveTabId}
      stickyChrome={stickyChrome}
      stickyTabsClassName={stickyTabsClassName}
      omitPanelBottomPadding={externalFooter}
    />
  )

  return (
    <TabbedFormChromeContext.Provider value={tabbedChrome}>
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
        validateSilently={validateSilently as ValidateSilently}
        onInvalidSubmit={handleInvalidSubmit}
        onSubmit={onSubmit}
        externalFooter={externalFooter}
        externalFooterPublisher={
          externalFooter ? <FormShellFooterPublisher model={externalFooterModel} /> : undefined
        }
        className={resolveTabbedFormShellClassName(className, stickyChrome, externalFooter)}
      >
        {valueSyncs && valueSyncs.length > 0 ? (
          <FormValueSyncEffects valueSyncs={valueSyncs} />
        ) : null}
        <FormRhythmStack>
          {resolvedHeader}
          {contentWrapper ? contentWrapper(panels) : panels}
          {externalFooter ? validationSummary : null}
        </FormRhythmStack>
        {!externalFooter ? (
          <TabbedFormFooterRegion
            hasFooterRegion={Boolean(formError || resolvedFooter)}
            stickyChrome={stickyChrome}
            stickyActionsBarClassName={stickyActionsBarClassName}
            formError={formError}
            validationSummary={validationSummary}
            resolvedFooter={resolvedFooter}
          />
        ) : null}
      </SchemaFormShell>
    </TabbedFormChromeContext.Provider>
  )
}
