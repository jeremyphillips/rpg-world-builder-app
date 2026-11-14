'use client'

import * as React from 'react'

import { ArrayFieldContext } from '../../context/array-field.context'
import { ArrayItemPresentationContext } from '../../context/array-item-presentation.context'
import { FormSectionContext } from '../../context/form-section.context'
import type { ArrayConfig } from '../../field-config'
import { NestedFormItems } from '../../containers/form-item-node.client'
import { arrayItemHasVisibleBodyFields } from '../../config/array/array-item-visible-body.lib'

export function renderArrayFieldItemFieldsNode(options: {
  config: ArrayConfig
  idPrefix: string
  itemPrefix: string
  itemBodyStackClasses: string
  suppressFieldErrorText: boolean
  presentationRowSummaryId: string
  arrayContext: React.ComponentProps<typeof ArrayFieldContext.Provider>['value']
  arrayItemFieldContext: React.ComponentProps<typeof FormSectionContext.Provider>['value']
  itemValues: Record<string, unknown>
}): { fieldsNode: React.ReactNode; itemBody: React.ReactNode | undefined } {
  const fieldsNode = (
    <ArrayItemPresentationContext.Provider
      value={{
        suppressFieldErrorText: options.suppressFieldErrorText,
        rowSummaryId: options.presentationRowSummaryId,
      }}
    >
      <ArrayFieldContext.Provider value={options.arrayContext}>
        <FormSectionContext.Provider value={options.arrayItemFieldContext}>
          <div className={options.itemBodyStackClasses}>
            <NestedFormItems
              items={options.config.fields}
              idPrefix={options.idPrefix}
              namePrefix={options.itemPrefix}
              depth={1}
            />
          </div>
        </FormSectionContext.Provider>
      </ArrayFieldContext.Provider>
    </ArrayItemPresentationContext.Provider>
  )

  const itemBody = arrayItemHasVisibleBodyFields(options.config.fields, options.itemValues)
    ? fieldsNode
    : undefined

  return { fieldsNode, itemBody }
}
