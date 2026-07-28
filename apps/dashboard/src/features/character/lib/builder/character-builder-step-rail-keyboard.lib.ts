import { BUILDER_STEPS } from '@rpg/contracts'
import type { CharacterBuilderStepId } from '@rpg/contracts/rpg/character-builder'

export type StepRailKeyboardDirection = 'up' | 'down' | 'home' | 'end'

export function resolveStepRailIndex(stepId: CharacterBuilderStepId): number {
  return BUILDER_STEPS.findIndex((step) => step.id === stepId)
}

export function resolveStepRailKeyboardTarget(
  direction: StepRailKeyboardDirection,
  currentIndex: number,
): number | null {
  if (currentIndex < 0) return null

  switch (direction) {
    case 'up':
      return currentIndex > 0 ? currentIndex - 1 : null
    case 'down':
      return currentIndex < BUILDER_STEPS.length - 1 ? currentIndex + 1 : null
    case 'home':
      return 0
    case 'end':
      return BUILDER_STEPS.length - 1
  }
}

export function resolveStepRailKeyboardDirection(key: string): StepRailKeyboardDirection | null {
  switch (key) {
    case 'ArrowUp':
      return 'up'
    case 'ArrowDown':
      return 'down'
    case 'Home':
      return 'home'
    case 'End':
      return 'end'
    default:
      return null
  }
}
