import { describe, expect, it } from 'vitest'

import {
  resolveStepRailIndex,
  resolveStepRailKeyboardDirection,
  resolveStepRailKeyboardTarget,
} from './character-builder-step-rail-keyboard.lib'

describe('character-builder-step-rail-keyboard', () => {
  it('resolves keyboard directions and targets', () => {
    expect(resolveStepRailKeyboardDirection('ArrowDown')).toBe('down')
    expect(resolveStepRailKeyboardDirection('Enter')).toBeNull()

    const currentIndex = resolveStepRailIndex('identity')
    expect(resolveStepRailKeyboardTarget('down', currentIndex)).toBe(currentIndex + 1)
    expect(resolveStepRailKeyboardTarget('up', currentIndex)).toBeNull()
    expect(resolveStepRailKeyboardTarget('home', currentIndex)).toBe(0)
  })
})
