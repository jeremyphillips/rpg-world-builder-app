import type { ReactNode } from 'react'

import { FieldChromeShell } from '../../../components/ui/field-chrome-shell'
import { hasActiveFieldChrome } from '../../../components/ui/field-chrome.variants'
import type { FieldSize } from '../../../components/ui/field.client'
import type { FieldRhythm } from '../../../components/ui/field.variants'
import { fieldGroupDescriptionClasses } from '../../../components/ui/field.variants'
import { Text } from '../../../components/ui/text'
import { FormRhythmStack } from '../../context/form-section.context'
import type { SlotConfig } from '../../field-config'
import { CompositeGroup } from '../../presentation/composite-group.client'
import { resolveSlotHeading } from '../../resolve-container-heading.lib'

export function buildSlotFieldBody(
  config: SlotConfig,
  content: ReactNode,
  _rhythm: FieldRhythm,
  size: FieldSize,
): ReactNode | null {
  const heading = resolveSlotHeading(config)

  if (heading) {
    return (
      <CompositeGroup
        heading={heading}
        className={config.className}
        size={size}
        useFieldset={false}
      >
        {content}
      </CompositeGroup>
    )
  }

  if (content == null && !config.hint) return null
  if (!config.hint) return content

  return (
    <FormRhythmStack className={config.className}>
      <Text variant="small" className={fieldGroupDescriptionClasses}>
        {config.hint}
      </Text>
      {content}
    </FormRhythmStack>
  )
}

export function wrapSlotFieldBody(
  body: ReactNode,
  config: SlotConfig,
  chromeSize: FieldSize,
): ReactNode {
  const heading = resolveSlotHeading(config)

  if (hasActiveFieldChrome(config.chrome)) {
    return (
      <FieldChromeShell
        chrome={config.chrome}
        size={chromeSize}
        className={!heading && !config.hint ? config.className : undefined}
      >
        {body}
      </FieldChromeShell>
    )
  }

  if (!heading && !config.hint && config.className) {
    return <div className={config.className}>{body}</div>
  }

  return body
}
