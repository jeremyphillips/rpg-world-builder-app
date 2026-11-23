import { formatFieldMessage } from '@rpg/contracts'
import type { ButtonDropdownItem } from '@rpg/ui'
import { expect } from 'vitest'

const STRUCTURED_MESSAGE_PREFIX = '\x00'

/** Asserts UI-facing acquisition copy is decoded plain text, not defineMessage transport. */
export function expectPlainDisplayCopy(
  display: string | undefined,
  options?: { transport?: string; label?: string },
): void {
  const label = options?.label ?? 'display copy'
  expect(display, `${label} is required`).toBeDefined()
  const value = display!
  expect(value, `${label} must not contain structured message prefix`).not.toContain(
    STRUCTURED_MESSAGE_PREFIX,
  )
  expect(value, `${label} must not expose encoded JSON payload`).not.toMatch(/\{"f":/)
  expect(value, `${label} must not expose validation message ids`).not.toMatch(
    /validation\.[a-zA-Z]+\.[a-zA-Z]/,
  )
  if (options?.transport !== undefined) {
    expect(value).toBe(formatFieldMessage(options.transport))
  }
}

/** Guards {@link toAcquisitionDropdownItem} output before it reaches ButtonDropdown. */
export function expectAcquisitionDropdownItemDisplayCopy(
  item: Pick<ButtonDropdownItem, 'disabledReason' | 'metadata'>,
  options?: { disabledReasonTransport?: string; metadataTransport?: string },
): void {
  if (item.disabledReason !== undefined) {
    expectPlainDisplayCopy(item.disabledReason, {
      transport: options?.disabledReasonTransport,
      label: 'disabledReason',
    })
  }
  if (item.metadata !== undefined) {
    expectPlainDisplayCopy(item.metadata, {
      transport: options?.metadataTransport,
      label: 'metadata',
    })
  }
}
