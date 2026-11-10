import { Alert, type AlertVariant } from './alert'
import type { IconName } from './icon/icon-glyphs'
import { Icon } from './icon/icon'

export const ADVISORY_TONES = ['info', 'warning', 'error'] as const

export type AdvisoryTone = (typeof ADVISORY_TONES)[number]

export type AdvisoryAlertProps = {
  tone: AdvisoryTone
  message: string
  title?: string
}

const ADVISORY_TONE_VARIANT = {
  info: 'info',
  warning: 'warning',
  error: 'destructive',
} as const satisfies Record<AdvisoryTone, AlertVariant>

const ADVISORY_TONE_ICON = {
  info: 'info',
  warning: 'triangle-alert',
  error: 'circle-alert',
} as const satisfies Record<AdvisoryTone, IconName>

/**
 * Persistent build note. Tone chooses the icon and Alert variant.
 * `announcement="none"` keeps form re-renders from repeating the note.
 */
export function AdvisoryAlert({ tone, message, title }: AdvisoryAlertProps) {
  return (
    <Alert
      variant={ADVISORY_TONE_VARIANT[tone]}
      density="compact"
      announcement="none"
      leading={<Icon name={ADVISORY_TONE_ICON[tone]} size="sm" />}
      title={title}
      description={message}
    />
  )
}
