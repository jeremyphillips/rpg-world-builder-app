export const TOAST_TONES = ['default', 'success', 'warning', 'destructive'] as const

export type ToastTone = (typeof TOAST_TONES)[number]

export const TOAST_DURATION = {
  default: 5000,
  success: 4000,
  warning: 7000,
  destructive: 8000,
} as const

export const TOAST_MAX_VISIBLE = 3

export const TOAST_DISMISS_LABEL = 'Dismiss notification'
