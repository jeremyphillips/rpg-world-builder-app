'use client'

import type { ReactNode } from 'react'

import { formStickyScrollShellWithDockedFooterClasses } from '../chrome/form-chrome.variants'
import type { FormItem, FormValueSync } from '../field-config'
import { FormFooterRegion, FormShellFieldStack } from './form-shell-field-stack.client'

type FormShellChildrenProps = {
  formId: string
  fields: FormItem[]
  contentClassName?: string
  scrollBodyClassName?: string
  externalFooter: boolean
  stickyFooter: boolean
  formError?: string | null
  valueSyncs?: FormValueSync[]
  header: ReactNode
  contentWrapper?: (content: ReactNode) => ReactNode
  footer: ReactNode
  usesDockedStickyFooter: boolean
  usesPageScrollStickyFooter: boolean
}

/** Footer/body layout branches for {@link Form} — docked, page-scroll, or default. */
export function FormShellChildren({
  formId,
  fields,
  contentClassName,
  scrollBodyClassName,
  externalFooter,
  stickyFooter,
  formError,
  valueSyncs,
  header,
  contentWrapper,
  footer,
  usesDockedStickyFooter,
  usesPageScrollStickyFooter,
}: FormShellChildrenProps) {
  if (usesDockedStickyFooter) {
    return (
      <div className={formStickyScrollShellWithDockedFooterClasses}>
        <FormShellFieldStack
          formId={formId}
          fields={fields}
          contentClassName={contentClassName}
          scrollBodyClassName={scrollBodyClassName}
          externalFooter={externalFooter}
          stickyFooter={stickyFooter}
          formError={formError}
          valueSyncs={valueSyncs}
          header={header}
          contentWrapper={contentWrapper}
        />
        <FormFooterRegion
          stickyFooter={stickyFooter}
          formError={formError}
          footer={footer}
          actionsBarPlacement="docked"
        />
      </div>
    )
  }

  if (usesPageScrollStickyFooter) {
    return (
      <>
        <FormShellFieldStack
          formId={formId}
          fields={fields}
          contentClassName={contentClassName}
          scrollBodyClassName={scrollBodyClassName}
          externalFooter={externalFooter}
          stickyFooter={false}
          formError={undefined}
          valueSyncs={valueSyncs}
          header={header}
          contentWrapper={contentWrapper}
        />
        <div className="mt-auto">
          <FormFooterRegion
            stickyFooter
            formError={formError}
            footer={footer}
            actionsBarPlacement="sticky"
          />
        </div>
      </>
    )
  }

  return (
    <>
      <FormShellFieldStack
        formId={formId}
        fields={fields}
        contentClassName={contentClassName}
        scrollBodyClassName={scrollBodyClassName}
        externalFooter={externalFooter}
        stickyFooter={stickyFooter}
        formError={formError}
        valueSyncs={valueSyncs}
        header={header}
        contentWrapper={contentWrapper}
      />
      {!externalFooter ? (
        <FormFooterRegion stickyFooter={stickyFooter} formError={formError} footer={footer} />
      ) : null}
    </>
  )
}
