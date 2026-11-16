import type { ReactNode } from 'react'

import { FormFieldChromeShell } from '../../context/form-field-chrome-shell.client'
import {
  hasActiveFieldChrome,
  type FieldChrome,
} from '../../../components/ui/field-chrome.variants'
import { fieldWidthVariants } from '../../../components/ui/field-control.variants'
import type { FieldSize } from '../../../components/ui/field.client'
import type { FieldRhythm } from '../../../components/ui/field.variants'
import { Text } from '../../../components/ui/text'
import { FormRhythmStack } from '../../context/form-section.context'
import { normalizeFieldHint, type SlotConfig } from '../../field-config'
import type { FormHeading } from '../../form-heading.lib'
import { CompositeGroup } from '../../presentation/composite-group.client'
import { resolveSlotHeading } from '../../resolve-container-heading.lib'

function slotHintSource(config: SlotConfig): FormHeading['hint'] | undefined {
  const legacy = (config as SlotConfig & { hint?: FormHeading['hint'] }).hint
  return config.heading?.hint ?? legacy
}

function resolveSlotCompositeHeading(config: SlotConfig): FormHeading | undefined {
  const heading = resolveSlotHeading(config)
  if (!heading) return undefined
  const hint = slotHintSource(config)
  if (hint !== undefined && heading.hint === undefined) {
    return { ...heading, hint }
  }
  return heading
}

function withSlotWidth(body: ReactNode, width: SlotConfig['width']): ReactNode {
  if (!width) return body
  return <div className={fieldWidthVariants({ width })}>{body}</div>
}

export function buildSlotFieldBody(
  config: SlotConfig,
  content: ReactNode,
  _rhythm: FieldRhythm,
  size: FieldSize,
): ReactNode | null {
  const heading = resolveSlotCompositeHeading(config)

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

  const hintText = normalizeFieldHint(slotHintSource(config)).text
  if (content == null && !hintText) return null
  if (!hintText) return content

  return (
    <FormRhythmStack className={config.className}>
      <Text as="span" variant="supporting">
        {hintText}
      </Text>
      {content}
    </FormRhythmStack>
  )
}

export function wrapSlotFieldBody(
  body: ReactNode,
  config: SlotConfig,
  chromeSize: FieldSize,
  resolvedChrome?: FieldChrome,
): ReactNode {
  const heading = resolveSlotCompositeHeading(config)
  const chrome = resolvedChrome ?? config.chrome
  const hintText = normalizeFieldHint(slotHintSource(config)).text

  if (hasActiveFieldChrome(chrome)) {
    return withSlotWidth(
      <FormFieldChromeShell
        chrome={chrome}
        size={chromeSize}
        className={!heading && !hintText ? config.className : undefined}
      >
        {body}
      </FormFieldChromeShell>,
      config.width,
    )
  }

  if (!heading && !hintText && config.className) {
    return withSlotWidth(<div className={config.className}>{body}</div>, config.width)
  }

  return withSlotWidth(body, config.width)
}
