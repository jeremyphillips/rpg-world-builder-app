'use client'

import * as React from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'
import {
  Button,
  Text,
  cn,
  dialogPanelActionRowClasses,
  dialogPanelSectionInsetXClasses,
} from '@rpg/ui'

import { DrawerShell } from '@/components/drawer'
import { drawerShellBodyVariants } from '@/components/drawer/drawer-shell.variants'
import {
  ContentFormHost,
  type ContentFormHostFormProps,
  type ContentFormHostLeaveBridge,
} from './content-form-host.client'

export type ContentFormDrawerFormProps<TFormValues extends FieldValues> =
  ContentFormHostFormProps<TFormValues>

export type ContentFormDrawerProps<TFormValues extends FieldValues> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: React.ReactNode
  form: ContentFormDrawerFormProps<TFormValues>
  pending: boolean
  submitLabel: string
  formError?: string | null
  extraUnsavedEdits?: boolean
  wrapForm?: (form: React.ReactNode) => React.ReactNode
  onSubmit: (values: TFormValues, form: UseFormReturn<TFormValues>) => void | Promise<void>
}

/** Neutral form workflow for contextual create/edit drawers. */
export function ContentFormDrawer<TFormValues extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  form,
  pending,
  submitLabel,
  formError = null,
  extraUnsavedEdits = false,
  wrapForm = (formNode) => formNode,
  onSubmit,
}: ContentFormDrawerProps<TFormValues>) {
  const leaveBridgeRef = React.useRef<ContentFormHostLeaveBridge | null>(null)

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        onOpenChange(true)
        return
      }
      if (pending) return
      const bridge = leaveBridgeRef.current
      if (bridge) {
        bridge.requestClose(() => onOpenChange(false))
        return
      }
      onOpenChange(false)
    },
    [onOpenChange, pending],
  )

  return (
    <DrawerShell
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      description={description}
      bodyMode="composed"
    >
      <ContentFormHost
        mounted={open}
        leaveGuardEnabled={open}
        pending={pending}
        formError={formError}
        extraUnsavedEdits={extraUnsavedEdits}
        wrapForm={wrapForm}
        form={form}
        leaveBridgeRef={leaveBridgeRef}
        onSubmit={onSubmit}
        onTrustedClose={() => onOpenChange(false)}
        contentClassName={cn(dialogPanelSectionInsetXClasses, 'pt-0')}
        chrome={{
          contentWrapper: (content) => (
            <DrawerShell.Body className={drawerShellBodyVariants({ mode: 'managed' })}>
              {content}
            </DrawerShell.Body>
          ),
          footerWrapper: ({ footer, formError: footerFormError }) => (
            <DrawerShell.Footer>
              {footerFormError ? (
                <Text variant="destructive" role="alert">
                  {footerFormError}
                </Text>
              ) : null}
              <div className={dialogPanelActionRowClasses}>{footer}</div>
            </DrawerShell.Footer>
          ),
          footer: () => (
            <>
              <DrawerShell.Close asChild>
                <Button type="button" variant="outline" disabled={pending}>
                  Cancel
                </Button>
              </DrawerShell.Close>
              <Button type="submit" disabled={pending}>
                {submitLabel}
              </Button>
            </>
          ),
        }}
      />
    </DrawerShell>
  )
}
