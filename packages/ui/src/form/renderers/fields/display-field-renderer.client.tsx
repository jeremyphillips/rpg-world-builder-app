'use client'

import * as React from 'react'

import { useDependsOnValues } from '../../config/form-depends-on.client'
import { useFormSectionContext } from '../../context/form-section.context'
import type { DisplayConfig } from '../../field-config'
import {
  collectDisplayDependsOn,
  displayContentIsEmpty,
  resolveDisplayBlocks,
} from '../../display/form-display-content.lib'
import { FormDisplayBlockView } from './display-field-renderer.lib'

export interface DisplayFieldRendererProps {
  config: DisplayConfig
  namePrefix?: string
}

export function DisplayFieldRenderer({ config, namePrefix }: DisplayFieldRendererProps) {
  const { reserveRulesPreview } = useFormSectionContext()
  const dependsOn = React.useMemo(() => collectDisplayDependsOn(config), [config])
  const watched = useDependsOnValues(dependsOn, namePrefix)

  const blocks = React.useMemo(() => {
    if (config.visibility && !config.visibility.visibleWhen(watched)) {
      return []
    }
    const resolveValues =
      config.resolve === undefined
        ? watched
        : Object.fromEntries(config.resolve.dependsOn.map((dep) => [dep, watched[dep]]))
    return resolveDisplayBlocks(config, resolveValues)
  }, [config, watched])

  if (reserveRulesPreview && blocks.some((block) => block.variant === 'rulesPreview')) {
    throw new Error('Rules preview belongs to the detail shell')
  }

  if (displayContentIsEmpty(blocks)) return null

  if (blocks.length === 1) {
    return <FormDisplayBlockView block={blocks[0]!} />
  }

  return (
    <div className="flex flex-col gap-2">
      {blocks.map((block, index) => (
        <FormDisplayBlockView key={`${config.id}-${index}`} block={block} />
      ))}
    </div>
  )
}

interface DisplayFormItemSectionProps {
  item: DisplayConfig
  namePrefix?: string
}

function ConditionalDisplayFormItemSection({ item, namePrefix }: DisplayFormItemSectionProps) {
  const values = useDependsOnValues(item.visibility!.dependsOn, namePrefix)
  if (!item.visibility!.visibleWhen(values)) return null
  return <DisplayFieldRenderer config={item} namePrefix={namePrefix} />
}

/** Renders a schema-driven read-only display item inside `FormProvider`. */
export function DisplayFormItemSection({ item, namePrefix }: DisplayFormItemSectionProps) {
  if (item.visibility) {
    return <ConditionalDisplayFormItemSection item={item} namePrefix={namePrefix} />
  }
  return <DisplayFieldRenderer config={item} namePrefix={namePrefix} />
}
