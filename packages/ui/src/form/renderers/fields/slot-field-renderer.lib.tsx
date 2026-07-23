import type { ReactNode } from 'react'

import { FieldGroup } from '../../../components/ui/field-group'
import { FieldChromeShell } from '../../../components/ui/field-chrome-shell'
import { hasActiveFieldChrome } from '../../../components/ui/field-chrome.variants'
import type { FieldSize } from '../../../components/ui/field.client'
import { fieldGroupDescriptionClasses } from '../../../components/ui/field.variants'
import { Text } from '../../../components/ui/text'
import { FormRhythmStack, type FormSectionContextValue } from '../../context/form-section.context'
import type { SlotConfig } from '../../field-config'

export function buildSlotFieldBody(
  config: SlotConfig,
  content: ReactNode,
  rhythm: FormSectionContextValue['rhythm'],
  size: FormSectionContextValue['size'],
): ReactNode | null {
  if (config.label) {
    return (
      <FieldGroup
        legend={config.label}
        description={config.hint}
        rhythm={rhythm}
        size={size}
        className={config.className}
      >
        {content}
      </FieldGroup>
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
  if (hasActiveFieldChrome(config.chrome)) {
    return (
      <FieldChromeShell
        chrome={config.chrome}
        size={chromeSize}
        className={!config.label && !config.hint ? config.className : undefined}
      >
        {body}
      </FieldChromeShell>
    )
  }

  if (!config.label && !config.hint && config.className) {
    return <div className={config.className}>{body}</div>
  }

  return body
}
