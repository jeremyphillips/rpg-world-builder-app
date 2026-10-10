export const UI_LABEL_SIZER_CLASS = 'ui-label-sizer' as const
export const UI_LABEL_SIZER_GHOST_CLASS = 'ui-label-sizer__ghost' as const
export const UI_LABEL_SIZER_LIVE_CLASS = 'ui-label-sizer__live' as const

export function labelSizerBlockClasses(): string {
  return UI_LABEL_SIZER_CLASS
}

export function labelSizerGhostClasses(): string {
  return UI_LABEL_SIZER_GHOST_CLASS
}

export function labelSizerLiveClasses(): string {
  return UI_LABEL_SIZER_LIVE_CLASS
}
