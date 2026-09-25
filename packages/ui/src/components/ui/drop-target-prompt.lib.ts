import {
  DROP_TARGET_ACTIVE_TITLE,
  DROP_TARGET_INVALID_MESSAGE,
  type resolveDropTargetCopy,
} from './drop-target-copy.lib'

export type DropTargetPromptState = 'idle' | 'active' | 'invalid' | 'disabled'

export function resolveDropTargetPromptState(
  disabled: boolean,
  stateProp?: DropTargetPromptState,
): DropTargetPromptState {
  return disabled ? 'disabled' : (stateProp ?? 'idle')
}

export function resolveDropTargetLayoutBehavior(
  layout: 'inline' | 'cover',
  state: DropTargetPromptState,
): {
  hideIdleChromeInPlace: boolean
  showIdleChrome: boolean
} {
  const preserveInlineLayout = layout === 'inline'
  const overlayState = state === 'active' || state === 'invalid'
  return {
    hideIdleChromeInPlace: preserveInlineLayout && overlayState,
    showIdleChrome:
      state === 'idle' || state === 'disabled' || (preserveInlineLayout && overlayState),
  }
}

export function resolveDropTargetPromptTitle(
  state: DropTargetPromptState,
  idleTitle: ReturnType<typeof resolveDropTargetCopy>['title'],
): string {
  if (state === 'active') return DROP_TARGET_ACTIVE_TITLE
  if (state === 'invalid') return DROP_TARGET_INVALID_MESSAGE
  return idleTitle
}
