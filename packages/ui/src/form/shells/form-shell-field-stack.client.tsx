import type { ReactNode } from 'react'

import { Text } from '../../components/ui/text'
import { cn } from '../../lib/utils'
import { FormItems } from '../containers/form-items.client'
import { FormRhythmStack } from '../context/form-section.context'
import { FormActionsBar, type FormActionsBarVariant } from '../chrome/form-actions-bar'
import {
  formFooterSpacingClasses,
  formSheetScrollRegionClasses,
} from '../chrome/form-chrome.variants'
import { FormValueSyncEffects } from '../chrome/form-value-sync-effects.client'
import type { FormItem, FormValueSync } from '../field-config'

export type FormShellFieldStackProps = {
  formId: string
  fields: FormItem[]
  contentClassName?: string
  isSheetDockedFooter: boolean
  stickyFooter: boolean
  formError?: string | null
  valueSyncs?: FormValueSync[]
  header?: ReactNode
}

export function FormShellFieldStack({
  formId,
  fields,
  contentClassName,
  isSheetDockedFooter,
  stickyFooter,
  formError,
  valueSyncs,
  header,
}: FormShellFieldStackProps) {
  const stack = (
    <FormRhythmStack className={isSheetDockedFooter ? undefined : contentClassName}>
      {!stickyFooter && formError ? (
        <Text variant="destructive" role="alert">
          {formError}
        </Text>
      ) : null}
      {valueSyncs && valueSyncs.length > 0 ? (
        <FormValueSyncEffects valueSyncs={valueSyncs} />
      ) : null}
      {header}
      <FormItems items={fields} idPrefix={formId} />
    </FormRhythmStack>
  )

  if (!isSheetDockedFooter) {
    return stack
  }

  return <div className={cn(formSheetScrollRegionClasses, contentClassName)}>{stack}</div>
}

export type FormFooterRegionProps = {
  stickyFooter: boolean
  formError?: string | null
  footerVariant: FormActionsBarVariant
  footer: ReactNode
}

export function FormFooterRegion({
  stickyFooter,
  formError,
  footerVariant,
  footer,
}: FormFooterRegionProps) {
  if (stickyFooter) {
    return (
      <FormActionsBar formError={formError} variant={footerVariant}>
        {footer}
      </FormActionsBar>
    )
  }

  if (!footer) {
    return null
  }

  return <div className={formFooterSpacingClasses}>{footer}</div>
}
