'use client'

import * as React from 'react'
import type { Control, FieldValues } from 'react-hook-form'
import { useFormState } from 'react-hook-form'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { Field, type FieldSize } from './field.client'
import { FieldLayout } from './field-layout'
import type { FieldGroupDialogDisclosure as FieldGroupDialogDisclosureConfig } from './field-group-disclosure.types'
import { fieldGroupDialogDisclosureFieldsetClasses } from './field-group-dialog-disclosure.variants'
import { FieldGroupSummaryTrigger } from './field-group-summary-trigger.client'
import {
  DEFAULT_SUMMARY_CLOSE_LABEL,
  DEFAULT_SUMMARY_OPEN_LABEL,
  DEFAULT_SUMMARY_UNSAVED_SUFFIX,
  useSummaryDisclosureWatchedValues,
} from './field-group-summary-watch.lib'
import { fieldSetResetClasses, fieldStackRhythmVariants, type FieldRhythm } from './field.variants'
import { Modal } from './modal.client'

export type FieldGroupDialogDisclosureProps<TFieldValues extends FieldValues = FieldValues> = {
  legend: string
  panelId: string
  legendId: string
  size?: FieldSize
  rhythm?: FieldRhythm
  className?: string
  disclosure: FieldGroupDialogDisclosureConfig
  control: Control<TFieldValues>
  children: React.ReactNode
}

/** Faux-input summary that opens the group's editor in a modal — edits apply live; the footer only dismisses. */
export function FieldGroupDialogDisclosure<TFieldValues extends FieldValues = FieldValues>({
  legend,
  panelId,
  legendId,
  size = 'md',
  rhythm = 'compact',
  className,
  disclosure,
  control,
  children,
}: FieldGroupDialogDisclosureProps<TFieldValues>) {
  const watchedValues = useSummaryDisclosureWatchedValues(control, disclosure.summaryDependsOn)
  const { isDirty } = useFormState({ control })
  const [open, setOpen] = React.useState(false)

  const summary = React.useMemo(
    () => disclosure.resolveSummary(watchedValues),
    [disclosure, watchedValues],
  )

  const openLabel = disclosure.openLabel ?? DEFAULT_SUMMARY_OPEN_LABEL
  const closeLabel = disclosure.closeLabel ?? DEFAULT_SUMMARY_CLOSE_LABEL
  const unsavedSuffix = disclosure.unsavedSuffix ?? DEFAULT_SUMMARY_UNSAVED_SUFFIX
  const showDirtySuffix = Boolean(disclosure.showDirtySuffix && isDirty)
  const disabled = disclosure.disabled ?? false
  const headline = disclosure.dialogHeadline ?? legend

  return (
    <Field.Root hint={disclosure.hint} className={className}>
      <FieldLayout
        hintPosition="below-control"
        wrapControl={false}
        size={size}
        label={
          <Field.Label associate={false} id={legendId}>
            {legend}
          </Field.Label>
        }
        control={
          <Field.Control>
            <FieldGroupSummaryTrigger
              size={size}
              summary={summary}
              openLabel={openLabel}
              unsavedSuffix={unsavedSuffix}
              showDirtySuffix={showDirtySuffix}
              disabled={disabled}
              labelledBy={legendId}
              expanded={open}
              hasPopup="dialog"
              onOpen={() => setOpen(true)}
            />
          </Field.Control>
        }
      />

      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Content size={disclosure.dialogSize ?? 'md'}>
          <Modal.Header headline={headline} description={disclosure.dialogDescription} />
          <Modal.Body>
            <fieldset
              className={cn(fieldSetResetClasses, fieldGroupDialogDisclosureFieldsetClasses)}
            >
              <legend className="sr-only">{legend}</legend>
              <div id={panelId} className={fieldStackRhythmVariants({ rhythm })}>
                {children}
              </div>
            </fieldset>
          </Modal.Body>
          <Modal.Footer>
            <Modal.FooterActions>
              <Button type="button" onClick={() => setOpen(false)}>
                {closeLabel}
              </Button>
            </Modal.FooterActions>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </Field.Root>
  )
}
