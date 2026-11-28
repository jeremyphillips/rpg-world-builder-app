/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'

import type { InvalidSubmitNavigation } from '../errors/resolve-invalid-submit-navigation'
import { isInvalidSubmitFocusTargetMounted } from './navigate-invalid-submit-reveal.lib'

describe('isInvalidSubmitFocusTargetMounted', () => {
  it('returns false when no focus target exists in the document', () => {
    const navigation = {
      firstIssue: { path: 'name', message: 'Required' },
    } as InvalidSubmitNavigation

    expect(isInvalidSubmitFocusTargetMounted(navigation, 'form-1')).toBe(false)
  })
})
