import type { ReactNode } from 'react'

import { Text } from '../../components/ui/text'
import { cn } from '../../lib/utils'
import { FormItems } from '../containers/form-items.client'
import { FormRhythmStack } from '../context/form-section.context'
import { FormActionsBar, type FormActionsBarPlacement } from '../chrome/form-actions-bar'
import {
  formFooterSpacingClasses,
  formSheetScrollRegionClasses,
  formStickyScrollBodyClasses,
} from '../chrome/form-chrome.variants'
import { FormValueSyncEffects } from '../chrome/form-value-sync-effects.client'
import type { FormItem, FormValueSync } from '../field-config'

export type FormShellFieldStackProps = {
  formId: string
  fields: FormItem[]
  contentClassName?: string
  externalFooter: boolean
  stickyFooter: boolean
  formError?: string | null
  valueSyncs?: FormValueSync[]
  header?: ReactNode
  contentWrapper?: (content: React.ReactNode) => React.ReactNode
}

export function FormShellFieldStack({
  formId,
  fields,
  contentClassName,
  externalFooter,
  stickyFooter,
  formError,
  valueSyncs,
  header,
  contentWrapper,
}: FormShellFieldStackProps) {
  const stack = (
    <FormRhythmStack className={externalFooter ? undefined : contentClassName}>
      {!stickyFooter && !externalFooter && formError ? (
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

  const scrollWrappedStack = externalFooter ? (
    <div className={cn(formSheetScrollRegionClasses, contentClassName)}>{stack}</div>
  ) : stickyFooter ? (
    <div className={formStickyScrollBodyClasses}>{stack}</div>
  ) : (
    stack
  )

  return contentWrapper && !stickyFooter ? contentWrapper(scrollWrappedStack) : scrollWrappedStack
}

export type FormFooterRegionProps = {
  stickyFooter: boolean
  formError?: string | null
  footer: ReactNode
  actionsBarPlacement?: FormActionsBarPlacement
}

export function FormFooterRegion({
  stickyFooter,
  formError,
  footer,
  actionsBarPlacement = 'sticky',
}: FormFooterRegionProps) {
  if (stickyFooter) {
    return (
      <FormActionsBar formError={formError} placement={actionsBarPlacement}>
        {footer}
      </FormActionsBar>
    )
  }

  if (!footer) {
    return null
  }

  return <div className={formFooterSpacingClasses}>{footer}</div>
}
