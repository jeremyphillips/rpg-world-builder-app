'use client'

import type { FieldHintPosition } from './field.variants'
import type { FieldSize } from './field.client'
import { FieldErrorText } from './field.client'
import { Text } from './text'

export type OptionalDisclosureRowMessageProps = {
  controlId: string
  size?: FieldSize
  error?: string
  hint?: string
  hintPosition?: FieldHintPosition
}

/**
 * Hint/error slot for {@link OptionalFieldDisclosure} in anatomy-grid rows.
 * Ids match {@link Field.Root} so controls keep a stable `aria-describedby`.
 */
export function OptionalDisclosureRowMessage({
  controlId,
  size = 'md',
  error,
  hint,
  hintPosition = 'below-control',
}: OptionalDisclosureRowMessageProps) {
  const hintId = `${controlId}-hint`
  const errorId = `${controlId}-error`
  const hasError = Boolean(error)
  const hasHint = Boolean(hint)

  if (hasError) {
    return (
      <FieldErrorText id={errorId} size={size}>
        {error}
      </FieldErrorText>
    )
  }

  if (!hasHint || hintPosition !== 'below-control') return null

  return (
    <Text id={hintId} as="p" variant="caption" className="min-w-0 max-w-full break-words">
      {hint}
    </Text>
  )
}
