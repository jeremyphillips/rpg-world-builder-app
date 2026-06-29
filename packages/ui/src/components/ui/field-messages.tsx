import { Text } from './text'

interface FieldMessageIds {
  hintId: string
  errorId: string
}

interface FieldHintErrorContent {
  hint?: string
  error?: string
}

export function FieldHintText({ id, children }: { id: string; children: string }) {
  return (
    <Text id={id} variant="caption">
      {children}
    </Text>
  )
}

export function FieldErrorText({ id, children }: { id: string; children: string }) {
  return (
    <Text id={id} variant="destructive" role="alert" aria-live="polite">
      {children}
    </Text>
  )
}

/** Hint for below-label placement — hidden while an error is present. */
export function FieldHintBelowLabel({
  hint,
  error,
  hintId,
}: FieldHintErrorContent & Pick<FieldMessageIds, 'hintId'>) {
  if (error || !hint) return null
  return <FieldHintText id={hintId}>{hint}</FieldHintText>
}

/** Hint or error after the control (legacy placement). */
export function FieldHintErrorBelowControl({
  hint,
  error,
  hintId,
  errorId,
}: FieldHintErrorContent & FieldMessageIds) {
  if (error) return <FieldErrorText id={errorId}>{error}</FieldErrorText>
  if (hint) return <FieldHintText id={hintId}>{hint}</FieldHintText>
  return null
}
